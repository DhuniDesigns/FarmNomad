package com.farmnomad.api.config;

import static org.springframework.security.config.Customizer.withDefaults;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
    return http
        .csrf(AbstractHttpConfigurer::disable)
        .cors(withDefaults())
        // JWT bearer auth is stateless — no server-side HTTP session.
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/actuator/health", "/api/health").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/listings", "/api/listings/*").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login", "/api/auth/refresh").permitAll()
            // The STOMP handshake is a plain HTTP GET with no bearer header —
            // clients authenticate over the STOMP CONNECT frame instead (see
            // StompAuthChannelInterceptor), so the handshake itself has to be
            // let through here or it never reaches that interceptor.
            .requestMatchers("/ws/**").permitAll()
            // Only a listing's owner can edit/archive/re-flag it — that's an
            // ownership check, not a role check, so it's enforced in
            // ListingService (403 via ListingForbidden), not here.
            .requestMatchers(HttpMethod.POST, "/api/listings").hasAnyRole("FARMER", "KITCHEN")
            .requestMatchers("/api/drivers/me/location").hasRole("DRIVER")
            .requestMatchers(HttpMethod.GET, "/api/surplus/nearby").hasAnyRole("ORGANISATION", "ADMIN")
            .anyRequest().authenticated())
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}
