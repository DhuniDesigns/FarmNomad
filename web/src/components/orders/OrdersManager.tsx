"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { StatusPill } from "@/components/ui/StatusPill";
import { useDemoStore } from "@/lib/demo/store";
import { triggerHaptic } from "@/lib/interactions";
import { formatDate } from "@/lib/utils";

export function OrdersManager() {
  const { state, currentVendor, currentUser } = useDemoStore();
  const orders = currentUser.role === "ADMIN" ? state.orders : state.orders.filter((order) => order.vendorId === currentVendor.id);
  const reduceMotion = useReducedMotion();

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Commitment orders</p>
      <h1 className="font-editorial mt-2 text-5xl leading-none text-ink-900 md:text-6xl">Orders</h1>
      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-[0_1px_18px_rgba(23,35,27,0.04)]">
        <div className="hidden grid-cols-[1fr_1fr_120px_160px] border-b border-border bg-soft/60 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 md:grid">
          <span>Buyer</span><span>Listing</span><span>Status</span><span>Note</span>
        </div>
        <div className="divide-y divide-border">
          {orders.map((order, index) => {
            const listing = state.listings.find((candidate) => candidate.id === order.listingId);
            return (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                key={order.id}
                transition={{ duration: reduceMotion ? 0 : 0.18, delay: reduceMotion ? 0 : index * 0.025, ease: [0.16, 1, 0.3, 1] }}
                whileHover={reduceMotion ? undefined : { x: 3 }}
              >
                <Link className="grid gap-3 p-5 transition-colors duration-150 ease-[var(--ease-farm-out)] hover:bg-soft md:grid-cols-[1fr_1fr_120px_160px]" href={`/orders/${order.id}`} onClick={() => triggerHaptic("selection")}>
                  <div>
                    <p className="font-semibold text-ink-900">{order.buyerName}</p>
                    <p className="text-sm text-ink-500">{order.buyerType}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-ink-900">{listing?.title ?? "Archived listing"}</p>
                    <p className="text-sm text-ink-500">{order.quantity} units - {formatDate(order.createdAt)}</p>
                  </div>
                  <StatusPill value={order.status} />
                  <p className="line-clamp-2 text-sm font-medium leading-6 text-ink-700">{order.note}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
