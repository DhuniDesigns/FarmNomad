import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Called client-side (see lib/api/revalidateMarket.ts) right after a listing
 * mutation (create/update/archive/surplus) succeeds, so the public /market
 * and /market/[id] ISR pages don't sit stale for the rest of their 300s
 * window (see publicListings.ts, which tags its fetches "listings" and
 * `listing:${id}` for exactly this). Best-effort: if this call fails or is
 * never made, the pages still catch up within 300s regardless.
 *
 * Next.js 16's `revalidateTag` requires a second "profile" argument. The
 * recommended default, `"max"`, only marks the tag stale-while-revalidate —
 * the next visitor still gets the old page while a fresh one loads in the
 * background, which isn't "soon after" for a vendor immediately checking
 * their own new listing. `{ expire: 0 }` is what Next's docs recommend for
 * exactly this shape of caller (an external trigger, here our own client
 * code, wanting the tag to expire immediately rather than just go stale).
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}) as Record<string, unknown>);
  const id = typeof body.id === "string" ? body.id : undefined;

  revalidateTag("listings", { expire: 0 });
  if (id) {
    revalidateTag(`listing:${id}`, { expire: 0 });
  }

  return NextResponse.json({ revalidated: true });
}
