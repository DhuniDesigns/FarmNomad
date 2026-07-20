"use client";

import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { useDemoStore } from "@/lib/demo/store";

export function AdminUsers() {
  const { state, actions } = useDemoStore();

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Admin operations</p>
      <h1 className="font-editorial mt-2 text-5xl leading-none text-ink-900 md:text-6xl">Users and verification</h1>
      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-[0_1px_18px_rgba(23,35,27,0.04)]">
        <div className="hidden grid-cols-[1fr_140px_140px_120px] border-b border-border bg-soft/60 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 md:grid">
          <span>User</span><span>Role</span><span>Status</span><span>Action</span>
        </div>
        <div className="divide-y divide-border">
          {state.users.map((user) => (
            <div className="grid gap-3 p-5 md:grid-cols-[1fr_140px_140px_120px] md:items-center" key={user.id}>
              <div>
                <p className="font-semibold text-ink-900">{user.name}</p>
                <p className="text-sm text-ink-500">{user.email} - {user.location}</p>
              </div>
              <p className="text-sm font-semibold text-ink-700">{user.role}</p>
              <StatusPill value={user.organisationStatus ?? "VERIFIED"} />
              {user.role === "ORGANISATION" && user.organisationStatus !== "VERIFIED" ? (
                <Button type="button" onClick={() => actions.verifyUser(user.id)}>Verify</Button>
              ) : <span className="text-sm font-semibold text-ink-500">No action</span>}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
