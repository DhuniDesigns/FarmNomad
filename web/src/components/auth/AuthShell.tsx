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
    <main className="min-h-screen w-full bg-white text-ink-900 lg:grid lg:grid-cols-[1.1fr_1fr]">
      <div className="relative min-h-[320px] overflow-hidden sm:min-h-[420px] lg:min-h-screen">
        <Image
          alt="Fresh FarmNomad produce arranged as a sculptural supply route"
          className="fn-hero-media object-cover"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
          src="/images/farmnomad-auth-still-life.png"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/64 via-ink-950/8 to-transparent" />
        <div className="fn-reveal fn-delay-2 absolute inset-x-0 bottom-0 p-6 text-white sm:p-8 lg:p-12">
          <p className="max-w-sm text-sm font-semibold uppercase tracking-wide text-white/80">Marketplace, surplus, logistics</p>
          <p className="font-editorial mt-3 max-w-md text-3xl leading-[1.05] sm:text-4xl">One operating layer for food moving from field to handover.</p>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-320px)] flex-col px-6 py-8 sm:px-10 sm:py-10 lg:min-h-screen lg:px-16 lg:py-10 xl:px-20">
        <div className="fn-reveal flex items-center justify-between gap-4">
          <Link className="inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-sm font-semibold text-ink-700 transition-colors hover:text-primary-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-600/30" href="/market">
            <ArrowLeft aria-hidden="true" size={17} />
            Market
          </Link>
          <BrandLogo href="/" priority size="sm" />
        </div>

        <div className="my-auto w-full py-10">
          <div className="fn-reveal fn-delay-1 mx-auto w-full max-w-[440px]">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">{eyebrow}</p>
            <h1 className="font-editorial mt-3 text-4xl leading-tight text-ink-950 sm:text-5xl">{title}</h1>
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
    </main>
  );
}
