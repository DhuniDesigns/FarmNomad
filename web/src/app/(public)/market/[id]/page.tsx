import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ListingDetailExperience } from "@/components/market/ListingDetailExperience";
import { BackLink } from "@/components/ui/BackLink";
import { getPublicListing, getPublicListings } from "@/lib/api/publicListings";

export const revalidate = 300;

type ListingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { id } = await params;
  const outcome = await getPublicListing(id);

  if (outcome.status === "not-found") {
    notFound();
  }

  if (outcome.status === "backend-error") {
    return (
      <>
        <PublicHeader />
        <main className="min-h-screen bg-canvas px-5 py-10">
          <div className="mx-auto max-w-3xl rounded-2xl border border-dashed border-border bg-white p-8 text-center">
            <h1 className="font-editorial text-5xl leading-none text-ink-900">Couldn&apos;t load this listing</h1>
            <p className="mt-2 text-ink-700">
              The marketplace API is unreachable right now. Reload the page to try again, or contact support if this keeps happening.
            </p>
            <BackLink className="mt-5 justify-center" href="/market" label="Back to market" />
          </div>
        </main>
      </>
    );
  }

  const { listing } = outcome;
  const { page: relatedPage } = await getPublicListings({ category: listing.category, size: 4 });
  const relatedListings = relatedPage.content.filter((candidate) => candidate.id !== listing.id).slice(0, 3);

  return (
    <>
      <PublicHeader />
      <ListingDetailExperience listing={listing} relatedListings={relatedListings} />
    </>
  );
}
