"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { BarChart3, ClipboardList, LayoutDashboard, LogIn, Settings, ShieldCheck, Store, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { useDemoStore } from "@/lib/demo/store";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["FARMER", "KITCHEN", "ORGANISATION", "ADMIN"] },
  { href: "/listings", label: "My listings", icon: Store, roles: ["FARMER", "KITCHEN"] },
  { href: "/orders", label: "Orders", icon: ClipboardList, roles: ["FARMER", "KITCHEN", "ORGANISATION", "ADMIN"] },
  { href: "/organisation/requests", label: "Surplus requests", icon: ShieldCheck, roles: ["ORGANISATION", "ADMIN"] },
  { href: "/admin/users", label: "Users", icon: Users, roles: ["ADMIN"] },
  { href: "/admin/listings", label: "Moderation", icon: BarChart3, roles: ["ADMIN"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["FARMER", "KITCHEN", "ORGANISATION", "ADMIN"] }
] as const;

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, currentUser, actions } = useDemoStore();
  const visibleNav = nav.filter((item) => item.roles.includes(currentUser.role as never));
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[276px_1fr]">
      <Toast message={state.toast} onClear={actions.clearToast} />
      <aside className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex min-h-16 items-center justify-between px-5 lg:block lg:min-h-0 lg:p-5">
          <Link className="flex items-center gap-3 text-base font-semibold text-ink-900" href="/dashboard">
            <span className="grid size-9 place-items-center rounded-lg bg-ink-900 text-sm font-semibold text-white">FN</span>
            FarmNomad
          </Link>
          <Link className="text-sm font-semibold text-primary-700 lg:hidden" href="/market">Market</Link>
        </div>
        <div className="hidden px-5 lg:block">
          <div className="rounded-xl border border-border bg-soft p-4">
            <p className="text-sm font-semibold text-ink-900">{currentUser.name}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary-700">{currentUser.role}</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:mt-5 lg:grid lg:overflow-visible lg:px-3" aria-label="Platform">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                className={cn(
                  "relative flex min-h-11 shrink-0 items-center gap-3 overflow-hidden rounded-lg px-3 text-sm font-semibold text-ink-700 transition-colors duration-150 ease-[var(--ease-farm-out)] hover:bg-soft hover:text-ink-900",
                  active && "text-white hover:text-white"
                )}
                href={item.href}
                key={item.href}
              >
                {active ? (
                  <motion.span
                    className="absolute inset-0 rounded-lg bg-primary-600 shadow-[0_10px_24px_rgba(29,74,52,0.16)]"
                    layoutId="platform-active-nav"
                    transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
                  />
                ) : null}
                <span className="relative z-10 flex items-center gap-3">
                  <Icon aria-hidden="true" size={18} />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="hidden px-5 py-4 lg:block">
          <Button className="w-full" type="button" variant="secondary" onClick={() => actions.loginAs(currentUser.role === "ADMIN" ? "FARMER" : "ADMIN")}>
            <LogIn aria-hidden="true" size={17} /> Switch demo role
          </Button>
        </div>
      </aside>
      <div>
        <header className="hidden border-b border-border bg-white/85 px-6 py-4 backdrop-blur lg:flex lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">Local V1 demo</p>
            <p className="mt-1 text-sm font-semibold text-ink-700">All changes persist in browser storage.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link className="text-sm font-semibold text-ink-700 hover:text-primary-700" href="/market">View market</Link>
            <Button type="button" variant="secondary" onClick={actions.resetDemo}>Reset demo data</Button>
          </div>
        </header>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          key={pathname}
          transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
