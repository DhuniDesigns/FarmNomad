"use client";

import Link from "next/link";
import { ArrowUpRight, Package, Plus, Scale, ShoppingBasket } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { useDemoStore } from "@/lib/demo/store";
import { formatCurrency, formatDate } from "@/lib/utils";

export function DashboardHome() {
  const { state, currentVendor } = useDemoStore();
  const vendorListings = state.listings.filter((listing) => listing.vendorId === currentVendor.id);
  const vendorOrders = state.orders.filter((order) => order.vendorId === currentVendor.id);
  const activeListings = vendorListings.filter((listing) => listing.status === "ACTIVE").length;
  const pendingOrders = vendorOrders.filter((order) => order.status === "PENDING").length;
  const revenue = vendorOrders.reduce((sum, order) => {
    const listing = state.listings.find((candidate) => candidate.id === order.listingId);
    return sum + ((listing?.pricePence ?? 0) * order.quantity);
  }, 0);
  const surplus = vendorListings.filter((listing) => listing.surplus).reduce((sum, listing) => sum + listing.quantity, 0);

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Vendor dashboard</p>
          <h1 className="font-editorial mt-2 text-5xl leading-none text-ink-900 md:text-6xl">Stock, requests, and activity</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-ink-700">Manage the current supply loop for {currentVendor.name}.</p>
        </div>
        <ButtonLink href="/listings/new"><Plus size={18} /> New listing</ButtonLink>
      </div>

      <section className="mt-8 grid gap-3 rounded-2xl border border-border bg-white p-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={<Package size={20} />} label="Active listings" value={String(activeListings)} />
        <Stat icon={<ShoppingBasket size={20} />} label="Pending orders" value={String(pendingOrders)} />
        <Stat icon={<ArrowUpRight size={20} />} label="Committed value" value={formatCurrency(revenue)} />
        <Stat icon={<Scale size={20} />} label="Surplus listed" value={`${surplus} units`} />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_1px_18px_rgba(23,35,27,0.04)]">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="text-xl font-semibold text-ink-900">Incoming orders</h2>
            <Link className="text-sm font-semibold text-primary-700" href="/orders">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {vendorOrders.slice(0, 4).map((order) => {
              const listing = state.listings.find((candidate) => candidate.id === order.listingId);
              return (
                <Link className="grid gap-2 p-5 transition-colors duration-150 ease-[var(--ease-farm-out)] hover:bg-soft md:grid-cols-[1fr_auto]" href={`/orders/${order.id}`} key={order.id}>
                  <div>
                    <p className="font-semibold text-ink-900">{order.buyerName}</p>
                    <p className="text-sm text-ink-700">{order.quantity} x {listing?.title ?? "Listing"} - {formatDate(order.createdAt)}</p>
                  </div>
                  <StatusPill value={order.status} />
                </Link>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-[#152219] p-5 text-white shadow-[0_18px_42px_rgba(23,35,27,0.12)]">
          <h2 className="text-xl font-semibold">Today's operating note</h2>
          <p className="mt-3 text-sm leading-6 text-[#dceade]">
            Keep quantities tight and collection windows explicit. The public market updates from the same demo store, so listing edits are visible immediately.
          </p>
          <ButtonLink className="mt-5 bg-white text-ink-900 hover:bg-soft" href="/market">Check public market</ButtonLink>
        </div>
      </section>
    </main>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-soft/70 p-4">
      <div className="flex size-10 items-center justify-center rounded-lg bg-white text-primary-700">{icon}</div>
      <p className="mt-4 text-sm font-semibold text-ink-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink-900">{value}</p>
    </div>
  );
}
