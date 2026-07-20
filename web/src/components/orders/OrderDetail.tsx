"use client";

import { BackLink } from "@/components/ui/BackLink";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { Toast } from "@/components/ui/Toast";
import { useDemoStore } from "@/lib/demo/store";
import type { OrderStatus } from "@/lib/demo/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const statuses: OrderStatus[] = ["PENDING", "ACCEPTED", "READY", "COMPLETED", "CANCELLED"];

export function OrderDetail({ id }: { id: string }) {
  const { state, actions } = useDemoStore();
  const order = state.orders.find((candidate) => candidate.id === id);
  const listing = order ? state.listings.find((candidate) => candidate.id === order.listingId) : undefined;

  if (!order || !listing) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="font-editorial text-5xl leading-none text-ink-900">Order not found</h1>
        <BackLink className="mt-4" href="/orders" label="Back to orders" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
      <Toast message={state.toast} onClear={actions.clearToast} />
      <BackLink href="/orders" label="Back to orders" />
      <section className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-[0_1px_18px_rgba(23,35,27,0.04)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">{order.id}</p>
            <h1 className="font-editorial mt-2 text-5xl leading-none text-ink-900 md:text-6xl">{listing.title}</h1>
            <p className="mt-3 text-ink-700">{order.buyerName} - {order.quantity} {listing.unit} - {formatDate(order.createdAt)}</p>
          </div>
          <StatusPill value={order.status} />
        </div>
        <div className="mt-6 grid gap-4 border-y border-border py-5 md:grid-cols-3">
          <Metric label="Committed value" value={formatCurrency(order.quantity * listing.pricePence)} />
          <Metric label="Buyer type" value={order.buyerType} />
          <Metric label="Collection" value={listing.collectionWindow} />
        </div>
        <p className="mt-5 rounded-xl bg-soft p-4 text-sm font-semibold text-ink-700">{order.note}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {statuses.map((status) => (
            <Button key={status} type="button" variant={status === order.status ? "primary" : status === "CANCELLED" ? "danger" : "secondary"} onClick={() => actions.updateOrderStatus(order.id, status)}>
              Mark {status.toLowerCase()}
            </Button>
          ))}
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-ink-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-ink-900">{value}</p>
    </div>
  );
}
