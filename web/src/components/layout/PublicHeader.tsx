"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type PublicHeaderProps = {
  variant?: "default" | "overlay";
};

export function PublicHeader({ variant = "default" }: PublicHeaderProps) {
  const isOverlay = variant === "overlay";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isOverlay) return;

    function onScroll() {
      setScrolled(window.scrollY > 8);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isOverlay]);

  return (
    <header
      className={cn(
        "z-40 border-b transition-[box-shadow,border-color] duration-300 ease-[var(--ease-farm-out)]",
        isOverlay
          ? "absolute inset-x-0 top-0 border-white/18 bg-transparent text-white"
          : cn(
              "sticky top-0 border-border bg-canvas/95 backdrop-blur",
              scrolled ? "border-transparent shadow-[0_8px_28px_rgba(23,35,27,0.08)]" : "shadow-[0_0_0_rgba(23,35,27,0)]"
            )
      )}
    >
      <div className="mx-auto flex min-h-[72px] max-w-[1360px] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-4 sm:flex-nowrap lg:px-10">
        <BrandLogo href="/" priority size="md" variant={isOverlay ? "light" : "dark"} />
        <nav
          className={cn(
            "flex w-full min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-semibold sm:w-auto sm:flex-1 sm:justify-end sm:gap-x-5 md:gap-x-7 md:text-[14px]",
            isOverlay ? "text-white/86" : "text-ink-700"
          )}
          aria-label="Public"
        >
          <Link className={cn("fn-header-link", isOverlay && "fn-header-link-on-dark")} href="/market">
            Market
          </Link>
          <Link className={cn("fn-header-link", isOverlay && "fn-header-link-on-dark")} href="/#network">
            Network
          </Link>
          <Link className={cn("fn-header-link", isOverlay && "fn-header-link-on-dark")} href="/#surplus">
            Surplus
          </Link>
          <Link className={cn("fn-header-link", isOverlay && "fn-header-link-on-dark")} href="/login">
            Sign in
          </Link>
          <Link className={cn("fn-header-link", isOverlay && "fn-header-link-on-dark")} href="/dashboard">
            Dashboard
          </Link>
        </nav>
        <div className="hidden lg:block">
          <ButtonLink href="/market" variant={isOverlay ? "onDark" : "secondary"} className="fn-header-market-button rounded-full px-5">
            Browse market
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
