import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type PublicHeaderProps = {
  variant?: "default" | "overlay";
};

export function PublicHeader({ variant = "default" }: PublicHeaderProps) {
  const isOverlay = variant === "overlay";

  return (
    <header
      className={cn(
        "z-40 border-b backdrop-blur",
        isOverlay ? "absolute inset-x-0 top-0 border-white/18 bg-black/12 text-white" : "sticky top-0 border-border bg-canvas/95"
      )}
    >
      <div className="mx-auto flex min-h-[72px] max-w-[1360px] items-center justify-between gap-4 px-5 lg:px-10">
        <BrandLogo href="/" priority size="md" variant={isOverlay ? "light" : "dark"} />
        <nav className={cn("hidden items-center gap-7 text-[14px] font-medium md:flex", isOverlay ? "text-white/86" : "text-ink-700")} aria-label="Public">
          <Link href="/market">Market</Link>
          <Link href="/#network">Network</Link>
          <Link href="/#surplus">Surplus</Link>
          <Link href="/login">Sign in</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ButtonLink href="/market" variant={isOverlay ? "onDark" : "secondary"} className="hidden sm:inline-flex">
            Browse market
          </ButtonLink>
          <ButtonLink href="/register" variant={isOverlay ? "onDark" : "primary"} className="hidden md:inline-flex">
            Create account
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
