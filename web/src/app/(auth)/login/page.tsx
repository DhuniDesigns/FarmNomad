import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-canvas lg:grid-cols-[minmax(0,1fr)_520px]">
      <section className="hidden bg-panel-dark px-10 py-12 text-on-dark lg:flex lg:flex-col lg:justify-between">
        <Link className="flex items-center gap-3 text-base font-semibold" href="/">
          <span className="grid size-9 place-items-center rounded-lg bg-white text-sm font-semibold text-ink-900">FN</span>
          FarmNomad
        </Link>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-on-dark-subtle">Modern agricultural commerce</p>
          <h1 className="font-editorial mt-4 max-w-2xl text-7xl leading-[0.92]">Move good food with less waste.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-on-dark-muted">Manage listings, requests, verification, and commitment orders from one local demo workspace.</p>
        </div>
        <p className="text-sm text-on-dark-subtle">Lancashire pilot workspace - browser-stored demo data.</p>
      </section>
      <section className="grid place-items-center px-6 py-10">
        <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-[0_18px_42px_rgba(23,35,27,0.08)]">
          <h1 className="text-2xl font-semibold text-ink-900">Sign in to FarmNomad</h1>
          <p className="mt-2 text-sm leading-6 text-ink-700">Use your account to manage listings, requests, verification, and orders.</p>
          <Suspense fallback={<p className="mt-6 text-sm font-semibold text-ink-700">Loading demo auth…</p>}>
            <LoginForm />
          </Suspense>
          <p className="mt-6 text-sm text-ink-700">
            New here? <Link className="font-semibold text-primary-700" href="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
