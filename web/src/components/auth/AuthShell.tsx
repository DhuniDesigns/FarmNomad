import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

type AuthShellProps = {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  footer: React.ReactNode;
};

export function AuthShell({ children, description, eyebrow, footer, title }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-soft px-4 py-6 text-ink-900 sm:px-6 lg:grid lg:place-items-center lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-[1180px] overflow-hidden rounded-[32px] bg-white p-4 shadow-[0_28px_90px_rgba(16,32,24,0.12)] lg:min-h-[760px] lg:grid-cols-[1.08fr_0.92fr] lg:p-6">
        <div className="relative min-h-[280px] overflow-hidden rounded-[24px] bg-canvas lg:min-h-0">
          <Image
            alt="Fresh FarmNomad produce arranged as a sculptural supply route"
            className="object-cover"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 54vw"
            src="/images/farmnomad-auth-still-life.png"
          />
          <BrandLogo className="absolute left-5 top-5 z-10 h-12 w-[156px] rounded-xl bg-ink-950/72 px-3 py-2 ring-1 ring-white/15 backdrop-blur-sm sm:left-7 sm:top-7" href="/" label="FarmNomad home" size="sm" variant="light" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/62 via-ink-950/18 to-transparent p-5 text-white sm:p-7">
            <p className="max-w-sm text-sm font-semibold uppercase tracking-wide text-white/80">Marketplace, surplus, logistics</p>
            <p className="mt-2 max-w-md text-2xl font-semibold leading-tight">One operating layer for food moving from field to handover.</p>
          </div>
        </div>

        <div className="flex min-h-full flex-col px-2 py-6 sm:px-6 lg:px-12 lg:py-10">
          <div className="flex items-center justify-between gap-4">
            <Link className="inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-sm font-semibold text-ink-700 transition-colors hover:text-primary-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-600/30" href="/market">
              <ArrowLeft aria-hidden="true" size={17} />
              Market
            </Link>
            <BrandLogo href="/" priority size="sm" />
          </div>

          <div className="my-auto w-full py-10">
            <div className="mx-auto w-full max-w-[440px]">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">{eyebrow}</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl">{title}</h1>
              <p className="mt-3 text-sm leading-6 text-ink-700">{description}</p>
              {children}
              <div className="mt-7 border-t border-border pt-5 text-center text-sm text-ink-700">{footer}</div>
            </div>
          </div>

          <nav className="flex flex-wrap justify-center gap-3 text-sm font-semibold text-ink-700 sm:justify-end" aria-label="Auth page links">
            <Link className="inline-flex min-h-11 items-center rounded-lg px-2 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-600/30" href="/">Home</Link>
            <Link className="inline-flex min-h-11 items-center rounded-lg px-2 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-600/30" href="/market">Browse market</Link>
          </nav>
        </div>
      </section>
    </main>
  );
}
