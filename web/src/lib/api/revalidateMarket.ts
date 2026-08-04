/**
 * Best-effort ping to /api/revalidate-listings after a listing mutation
 * succeeds. Failure is intentionally swallowed — the public market ISR
 * pages fall back to their normal 300s revalidation window regardless, so a
 * failed ping degrades to "slightly stale for a bit," not broken.
 */
export async function revalidateMarket(listingId?: string) {
  try {
    await fetch("/api/revalidate-listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: listingId })
    });
  } catch {
    // See docstring above.
  }
}
