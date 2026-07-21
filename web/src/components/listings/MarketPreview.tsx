import { Sprout } from "lucide-react";

export function MarketPreview() {
  return (
    <aside className="rounded-2xl border border-border bg-soft p-5">
      <div className="flex size-11 items-center justify-center rounded-lg bg-primary-600 text-ink-950">
        <Sprout aria-hidden="true" size={22} />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-ink-900">Today's supply loop</h2>
      <dl className="mt-5 grid gap-4 text-sm">
        <div>
          <dt className="font-semibold text-ink-900">Listings</dt>
          <dd className="text-ink-700">Produce and surplus published by vendors.</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink-900">Requests</dt>
          <dd className="text-ink-700">Organisations and customers reserve available stock.</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink-900">Fulfilment</dt>
          <dd className="text-ink-700">Statuses keep all sides aligned through handover.</dd>
        </div>
      </dl>
    </aside>
  );
}
