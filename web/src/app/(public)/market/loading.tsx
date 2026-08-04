import { PublicHeader } from "@/components/layout/PublicHeader";

export default function MarketLoading() {
  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-canvas">
        <section className="border-b border-border bg-canvas">
          <div className="mx-auto grid max-w-[1360px] gap-10 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-10 lg:py-16">
            <div>
              <div className="h-4 w-32 animate-pulse rounded bg-soft" />
              <div className="mt-4 h-16 w-full max-w-3xl animate-pulse rounded bg-soft" />
              <div className="mt-5 h-5 w-2/3 max-w-xl animate-pulse rounded bg-soft" />
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-[1360px] gap-7 px-5 py-10 lg:grid-cols-[292px_1fr] lg:px-10">
          <aside className="hidden h-64 animate-pulse rounded-2xl border border-border bg-white lg:block" />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading listings">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="overflow-hidden rounded-xl border border-border bg-white" key={index}>
                <div className="aspect-[4/3] animate-pulse bg-soft" />
                <div className="grid gap-3 p-5">
                  <div className="h-4 w-20 animate-pulse rounded bg-soft" />
                  <div className="h-6 w-3/4 animate-pulse rounded bg-soft" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-soft" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
