import { EmptyState } from "@/components/ui/EmptyState";

export default function AdminDeliveriesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <EmptyState
        actionHref="/orders"
        actionLabel="Review order handovers"
        description="Collection windows and handover status live on commitment orders so the supply loop remains inspectable."
        title="Delivery coordination is tracked through orders"
      />
    </main>
  );
}
