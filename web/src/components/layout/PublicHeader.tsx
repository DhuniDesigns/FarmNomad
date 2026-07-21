import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex min-h-[72px] max-w-[1360px] items-center justify-between gap-4 px-5 lg:px-10">
        <Link className="flex items-center gap-3 text-[15px] font-semibold tracking-tight text-ink-900" href="/">
          <span className="grid size-10 place-items-center rounded-lg bg-ink-900 text-sm text-white">FN</span>
          <span className="text-lg">FarmNomad</span>
        </Link>
        <nav className="hidden items-center gap-7 text-[14px] font-medium text-ink-700 md:flex" aria-label="Public">
          <Link href="/market">Market</Link>
          <Link href="/login">Sign in</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
        <ButtonLink href="/register" className="hidden md:inline-flex">Create account</ButtonLink>
      </div>
    </header>
  );
}
