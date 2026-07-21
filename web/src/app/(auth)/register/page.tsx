import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen bg-canvas lg:grid-cols-[minmax(0,1fr)_640px]">
      <section className="hidden bg-panel-dark px-10 py-12 text-on-dark lg:flex lg:flex-col lg:justify-between">
        <Link className="flex items-center gap-3 text-base font-semibold" href="/">
          <span className="grid size-9 place-items-center rounded-lg bg-white text-sm font-semibold text-ink-900">FN</span>
          FarmNomad
        </Link>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-on-dark-subtle">Join the supply board</p>
          <h1 className="font-editorial mt-4 max-w-2xl text-7xl leading-[0.92]">List, source, and redirect local food.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-on-dark-muted">Create a farmer, kitchen, or organisation profile for the confirmed web MVP flow.</p>
        </div>
        <p className="text-sm text-on-dark-subtle">No payment setup required for this V1 demo.</p>
      </section>
      <section className="grid place-items-center px-6 py-10">
        <div className="w-full max-w-2xl rounded-2xl border border-border bg-white p-6 shadow-[0_18px_42px_rgba(23,35,27,0.08)]">
          <h1 className="text-2xl font-semibold text-ink-900">Create your FarmNomad account</h1>
          <p className="mt-2 text-sm leading-6 text-ink-700">Choose Farmer, Kitchen, or Organisation for the web MVP.</p>
          <RegisterForm />
        </div>
      </section>
    </main>
  );
}
