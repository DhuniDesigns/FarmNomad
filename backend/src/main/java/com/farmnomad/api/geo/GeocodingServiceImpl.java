package com.farmnomad.api.geo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

/**
 * Provider strategy: postcodes.io first (free, unlimited, no key, highly
 * accurate for UK), Mapbox as a fallback for addresses postcodes.io can't
 * resolve. Never lets a geocoding failure fail the caller's write — see
 * {@link GeocodingService}.
 */
@Service
class GeocodingServiceImpl implements GeocodingService {
  private static final Logger log = LoggerFactory.getLogger(GeocodingServiceImpl.class);

  // Matches a UK postcode with or without the internal space, anchored or
  // embedded in a longer free-text string (e.g. "12 Field Barn, Bristol BS1 4ST").
  private static final Pattern UK_POSTCODE = Pattern.compile("([A-Z]{1,2}\\d[A-Z\\d]?)\\s*(\\d[A-Z]{2})", Pattern.CASE_INSENSITIVE);

  private final RestClient postcodesIoClient;
  private final RestClient mapboxClient;
  private final PostcodeCache postcodeCache;
  private final String mapboxToken;

  GeocodingServiceImpl(
      PostcodeCache postcodeCache,
      @Value("${farmnomad.geocoding.postcodes-io-url:https://api.postcodes.io}") String postcodesIoUrl,
      @Value("${farmnomad.geocoding.mapbox-token:}") String mapboxToken,
      @Value("${farmnomad.geocoding.timeout-ms:3000}") int timeoutMs) {
    this.postcodeCache = postcodeCache;
    this.mapboxToken = mapboxToken;

    var factory = new SimpleClientHttpRequestFactory();
    factory.setConnectTimeout(timeoutMs);
    factory.setReadTimeout(timeoutMs);

    this.postcodesIoClient = RestClient.builder().baseUrl(postcodesIoUrl).requestFactory(factory).build();
    this.mapboxClient = RestClient.builder().baseUrl("https://api.mapbox.com").requestFactory(factory).build();
  }

  @Override
  public Optional<GeoPoint> geocodePostcode(String postcode) {
    String normalised = normalise(postcode);
    if (normalised == null) {
      return Optional.empty();
    }

    Optional<GeoPoint> cached = postcodeCache.get(normalised);
    if (cached.isPresent()) {
      return cached;
    }

    try {
      PostcodesIoLookupResponse response = postcodesIoClient.get()
          .uri("/postcodes/{postcode}", normalised)
          .retrieve()
          .body(PostcodesIoLookupResponse.class);

      if (response == null || response.result() == null || response.result().latitude() == null) {
        return Optional.empty();
      }

      GeoPoint point = new GeoPoint(response.result().latitude(), response.result().longitude(), GeocodeSource.POSTCODES_IO);
      postcodeCache.put(normalised, point);
      return Optional.of(point);
    } catch (Exception e) {
      log.warn("postcodes.io lookup failed for postcode [{}]", normalised, e);
      return Optional.empty();
    }
  }

  @Override
  public Optional<GeoPoint> geocodeFreeText(String text) {
    if (text == null || text.isBlank()) {
      return Optional.empty();
    }

    Optional<String> embeddedPostcode = extractPostcode(text);
    if (embeddedPostcode.isPresent()) {
      Optional<GeoPoint> fromPostcode = geocodePostcode(embeddedPostcode.get());
      if (fromPostcode.isPresent()) {
        return fromPostcode;
      }
    }

    return mapboxGeocode(text);
  }

  @Override
  public Optional<ReverseGeoResult> reverseGeocode(double lat, double lng) {
    try {
      PostcodesIoReverseResponse response = postcodesIoClient.get()
          .uri(uriBuilder -> uriBuilder
              .path("/postcodes")
              .queryParam("lon", lng)
              .queryParam("lat", lat)
              .build())
          .retrieve()
          .body(PostcodesIoReverseResponse.class);

      if (response == null || response.result() == null || response.result().isEmpty()) {
        return Optional.empty();
      }

      PostcodesIoResult nearest = response.result().get(0);
      return Optional.of(new ReverseGeoResult(nearest.postcode(), nearest.adminDistrict(), nearest.region()));
    } catch (Exception e) {
      log.warn("postcodes.io reverse lookup failed for [{}, {}]", lat, lng, e);
      return Optional.empty();
    }
  }

  private Optional<GeoPoint> mapboxGeocode(String query) {
    if (mapboxToken == null || mapboxToken.isBlank()) {
      // No token configured — a common, expected state in local dev. Not an error.
      return Optional.empty();
    }

    try {
      MapboxGeocodeResponse response = mapboxClient.get()
          .uri(uriBuilder -> uriBuilder
              .path("/geocoding/v5/mapbox.places/{query}.json")
              .queryParam("country", "gb")
              .queryParam("limit", 1)
              .queryParam("access_token", mapboxToken)
              .build(query))
          .retrieve()
          .body(MapboxGeocodeResponse.class);

      if (response == null || response.features() == null || response.features().isEmpty()) {
        return Optional.empty();
      }

      List<Double> center = response.features().get(0).center();
      if (center == null || center.size() < 2) {
        return Optional.empty();
      }

      // Mapbox returns [lng, lat], the reverse of everything else in this codebase.
      return Optional.of(new GeoPoint(center.get(1), center.get(0), GeocodeSource.MAPBOX));
    } catch (Exception e) {
      log.warn("Mapbox geocoding failed for query [{}]", query, e);
      return Optional.empty();
    }
  }

  /** Uppercase, single internal space — the normal form postcodes.io expects and the form used as the cache key. */
  private static String normalise(String postcode) {
    if (postcode == null) {
      return null;
    }
    String trimmed = postcode.trim().toUpperCase(Locale.UK).replaceAll("\\s+", "");
    Matcher matcher = UK_POSTCODE.matcher(trimmed);
    if (!matcher.matches()) {
      return null;
    }
    return matcher.group(1) + " " + matcher.group(2);
  }

  private static Optional<String> extractPostcode(String text) {
    Matcher matcher = UK_POSTCODE.matcher(text);
    if (!matcher.find()) {
      return Optional.empty();
    }
    return Optional.of(matcher.group(1) + " " + matcher.group(2));
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  private record PostcodesIoLookupResponse(int status, PostcodesIoResult result) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  private record PostcodesIoReverseResponse(int status, List<PostcodesIoResult> result) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  private record PostcodesIoResult(
      String postcode,
      Double latitude,
      Double longitude,
      @JsonProperty("admin_district") String adminDistrict,
      String region) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  private record MapboxGeocodeResponse(List<MapboxFeature> features) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  private record MapboxFeature(List<Double> center, @JsonProperty("place_name") String placeName) {}
}
