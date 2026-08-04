"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

function normaliseInternalHref(value: string | null | undefined, fallbackHref: string) {
  if (!value) return fallbackHref;

  try {
    const trimmed = value.trim();
    const candidate = trimmed.toLowerCase().startsWith("%2f") ? decodeURIComponent(trimmed) : trimmed;
    if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\")) return fallbackHref;
    return candidate;
  } catch {
    return fallbackHref;
  }
}

export function safeInternalHref(value: string | null | undefined, fallbackHref = "/market") {
  return normaliseInternalHref(value, fallbackHref);
}

type BackLinkProps = {
  href: string | null | undefined;
  label: string;
  fallbackHref?: string;
  className?: string;
  onNavigateAttempt?: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
};

export function BackLink({ className, fallbackHref = "/market", href, label, onNavigateAttempt }: BackLinkProps) {
  const safeHref = safeInternalHref(href, fallbackHref);

  return (
    <Link
      className={cn(
        "inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-primary-700 transition-[background-color,color,transform] duration-150 ease-[var(--ease-farm-out)] hover:bg-soft hover:text-primary-700 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent-500/25 motion-reduce:transition-none motion-reduce:active:scale-100",
        className
      )}
      href={safeHref}
      onClick={(event) => onNavigateAttempt?.(event, safeHref)}
    >
      <ArrowLeft aria-hidden="true" size={17} />
      {label}
    </Link>
  );
}
