import { PublicHeader } from "@/components/layout/PublicHeader";
import { BackLink } from "@/components/ui/BackLink";

export default function ListingNotFound() {
  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-canvas px-5 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-white p-8 text-center">
          <h1 className="font-editorial text-5xl leading-none text-ink-900">Listing not found</h1>
          <p className="mt-2 text-ink-700">This listing may have been archived, sold through, or the link is out of date.</p>
          <BackLink className="mt-5 justify-center" href="/market" label="Back to market" />
        </div>
      </main>
    </>
  );
}
