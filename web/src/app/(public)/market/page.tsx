import { PublicHeader } from "@/components/layout/PublicHeader";
import { MarketExperience } from "@/components/market/MarketExperience";
import { getPublicListings } from "@/lib/api/publicListings";

export const revalidate = 300;

type SearchParamValue = string | string[] | undefined;

type MarketPageProps = {
  searchParams: Promise<Record<string, SearchParamValue>>;
};

function first(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toValidPage(value: string | undefined): number {
  const parsed = Number(value ?? "0");
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
}

export default async function MarketPage({ searchParams }: MarketPageProps) {
  const params = await searchParams;

  const filters = {
    q: first(params.q) ?? "",
    category: first(params.category) ?? "all",
    region: first(params.region) ?? "all",
    supply: first(params.supply) ?? "all",
    sort: first(params.sort) ?? "newest",
    page: toValidPage(first(params.page))
  };

  const { page: listingPage, backendError } = await getPublicListings({
    q: filters.q,
    category: filters.category,
    location: filters.region,
    supply: filters.supply,
    sort: filters.sort,
    page: filters.page,
    size: 12
  });

  return (
    <>
      <PublicHeader />
      <MarketExperience filters={filters} listingPage={listingPage} backendError={backendError} />
    </>
  );
}
