import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-canvas">
        <section className="border-b border-border bg-canvas">
          <div className="mx-auto grid max-w-[1360px] gap-10 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-24">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">FarmNomad V1 demo</p>
              <h1 className="font-editorial mt-4 text-6xl leading-[0.92] text-ink-900 md:text-8xl">
                The supply desk for produce before it spoils.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-700">
                Farmers publish stock, organisations and kitchens request it, and Vendors manage every listing and commitment from one operating layer.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white" href="/market">Browse market</Link>
                <Link className="rounded-lg border border-border bg-white px-5 py-3 text-sm font-semibold text-ink-900" href="/dashboard">Open dashboard</Link>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-[#17231B] p-6 text-white">
              <p className="text-sm font-semibold text-[#b7d7bc]">Local demo loop</p>
              <div className="mt-6 grid gap-4">
                {["Search active listings", "Send order or surplus requests", "Create and edit Vendor listings", "Progress commitment orders"].map((item) => (
                  <div className="rounded-lg border border-white/15 bg-white/5 p-4 text-lg font-semibold" key={item}>{item}</div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
