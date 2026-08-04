"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { MarketListingCard } from "./MarketListingCard";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/Field";
import { triggerHaptic } from "@/lib/interactions";
import type { ListingPage } from "@/types/listing";

const categories = ["all", "Vegetables", "Fruit", "Dairy", "Bakery", "Prepared food", "Herbs"];
const regions = ["all", "Lancashire", "Greater Manchester", "Yorkshire"];
// "organic" and "distance" are deliberately absent: the backend has no is_organic
// column and no geo data yet, so those filters would silently no-op. See
// docs/DECISIONS.md "Unresolved questions" for the follow-up.
const supplies = ["all", "surplus", "sale"];
const sorts = ["newest", "price-asc", "quantity"];

export type MarketFilters = {
  q: string;
  category: string;
  region: string;
  supply: string;
  sort: string;
  page: number;
};

type MarketExperienceProps = {
  filters: MarketFilters;
  listingPage: ListingPage;
  backendError: boolean;
};

function buildHref(filters: MarketFilters) {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.category !== "all") params.set("category", filters.category);
  if (filters.region !== "all") params.set("region", filters.region);
  if (filters.supply !== "all") params.set("supply", filters.supply);
  if (filters.sort !== "newest") params.set("sort", filters.sort);
  if (filters.page > 0) params.set("page", String(filters.page));

  const query = params.toString();
  return query ? `/market?${query}` : "/market";
}

export function MarketExperience({ filters, listingPage, backendError }: MarketExperienceProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(filters.q);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const closeFiltersRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();

  const activeFilters = [
    filters.q ? { key: "q" as const, label: `Search: ${filters.q}` } : null,
    filters.category !== "all" ? { key: "category" as const, label: filters.category } : null,
    filters.region !== "all" ? { key: "region" as const, label: filters.region } : null,
    filters.supply !== "all" ? { key: "supply" as const, label: filters.supply === "surplus" ? "Surplus only" : "Sale listings" } : null
  ].filter(Boolean) as Array<{ key: "q" | "category" | "region" | "supply"; label: string }>;

  useEffect(() => {
    setSearchValue(filters.q);
  }, [filters.q]);

  useEffect(() => {
    if (!mobileFiltersOpen) return;
    closeFiltersRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileFiltersOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileFiltersOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;
      const isTyping = target instanceof HTMLElement && ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName);

      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey || isTyping) return;

      event.preventDefault();
      searchRef.current?.focus();
      triggerHaptic("selection");
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function navigate(next: Partial<MarketFilters>) {
    router.push(buildHref({ ...filters, page: 0, ...next }));
  }

  function updateFilter(key: "category" | "region" | "supply" | "sort", value: string) {
    triggerHaptic("selection");
    navigate({ [key]: value });
  }

  function clearFilter(key: "q" | "category" | "region" | "supply") {
    triggerHaptic("selection");
    navigate({ [key]: key === "q" ? "" : "all" });
  }

  function resetFilters() {
    triggerHaptic("selection");
    setSearchValue("");
    router.push("/market");
  }

  function closeMobileFilters() {
    triggerHaptic("selection");
    setMobileFiltersOpen(false);
  }

  function goToPage(nextPage: number) {
    router.push(buildHref({ ...filters, page: nextPage }));
  }

  const filterControls = (
    <div className="grid gap-3">
      <SelectField label="Category" value={filters.category} onChange={(event) => updateFilter("category", event.target.value)}>
        {categories.map((category) => <option key={category} value={category}>{category === "all" ? "All categories" : category}</option>)}
      </SelectField>
      <SelectField label="Region" value={filters.region} onChange={(event) => updateFilter("region", event.target.value)}>
        {regions.map((region) => <option key={region} value={region}>{region === "all" ? "All regions" : region}</option>)}
      </SelectField>
      <SelectField label="Supply type" value={filters.supply} onChange={(event) => updateFilter("supply", event.target.value)}>
        {supplies.map((supply) => (
          <option key={supply} value={supply}>
            {supply === "all" ? "Sale and surplus" : supply === "surplus" ? "Surplus only" : "Sale listings"}
          </option>
        ))}
      </SelectField>
      <SelectField label="Sort" value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value)}>
        {sorts.map((sort) => (
          <option key={sort} value={sort}>
            {sort === "newest" ? "Newest first" : sort === "price-asc" ? "Lowest price" : "Largest lots"}
          </option>
        ))}
      </SelectField>
      <Button type="button" variant="secondary" onClick={resetFilters}>
        Reset filters
      </Button>
    </div>
  );

  return (
    <main className="min-h-screen bg-canvas">
      <section className="border-b border-border bg-canvas">
        <div className="mx-auto grid max-w-[1360px] gap-10 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-10 lg:py-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Public market</p>
            <h1 className="font-editorial mt-4 max-w-4xl text-6xl leading-[0.92] text-ink-900 md:text-8xl">
              Browse live produce, surplus, and kitchen stock.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-700">
              Search local supply, compare collection windows, and send a commitment request without payment processing.
            </p>
            <form
              className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-[1fr_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                triggerHaptic("selection");
                searchRef.current?.blur();
                navigate({ q: searchValue });
              }}
            >
              <TextField
                ref={searchRef}
                aria-label="Search listings"
                className="w-full"
                label="Search"
                placeholder="Search apples, carrots, sourdough…"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
              <Button className="sm:mt-6" type="submit">
                <Search aria-hidden="true" size={18} /> Search
              </Button>
            </form>
          </div>
          <aside className="self-end rounded-2xl border border-border bg-panel-dark p-6 text-on-dark shadow-[0_22px_60px_rgba(23,35,27,0.18)]">
            <p className="text-sm font-semibold text-on-dark-subtle">Live stock board</p>
            <dl className="mt-5 grid grid-cols-2 gap-3">
              <div>
                <dt className="text-xs text-on-dark-subtle">Matching lots</dt>
                <dd className="text-2xl font-semibold">{listingPage.totalElements}</dd>
              </div>
              <div>
                <dt className="text-xs text-on-dark-subtle">Page</dt>
                <dd className="text-2xl font-semibold">{listingPage.number + 1} / {Math.max(listingPage.totalPages, 1)}</dd>
              </div>
            </dl>
            <p className="mt-5 text-sm leading-6 text-on-dark-muted">Listings come straight from the FarmNomad marketplace API and refresh every five minutes.</p>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1360px] gap-7 px-5 py-10 lg:grid-cols-[292px_1fr] lg:px-10">
        <aside className="hidden h-fit rounded-2xl border border-border bg-white p-5 shadow-[0_1px_18px_rgba(23,35,27,0.04)] lg:block">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-ink-900">
            <SlidersHorizontal aria-hidden="true" size={18} /> Filters
          </div>
          {filterControls}
        </aside>

        <div>
          {backendError ? (
            <div className="mb-5 rounded-xl border border-[#e0b889] bg-[#f3e5d7] px-4 py-3 text-sm font-medium text-warning-600" role="status">
              Showing a limited offline sample — the marketplace API is unreachable right now. Reload to try again.
            </div>
          ) : null}

          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink-700">{listingPage.totalElements} listings match your board</p>
            <Button className="lg:hidden" type="button" variant="secondary" onClick={() => {
              triggerHaptic("selection");
              setMobileFiltersOpen(true);
            }}>
              <SlidersHorizontal aria-hidden="true" size={18} /> Filters
            </Button>
          </div>

          {activeFilters.length > 0 ? (
            <div className="mb-5 flex flex-wrap gap-2" aria-label="Active filters">
              <AnimatePresence initial={false}>
              {activeFilters.map((filter) => (
                <motion.button
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-brand-border bg-white px-3 text-sm font-semibold text-ink-700 transition-colors duration-150 ease-[var(--ease-farm-out)] hover:border-primary-700 hover:bg-primary-700 hover:text-white active:border-primary-800 active:bg-primary-800 active:text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-600/30"
                  exit={{ opacity: 0, scale: 0.96, y: -4 }}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: -4 }}
                  key={filter.key}
                  layout
                  type="button"
                  onClick={() => clearFilter(filter.key)}
                  transition={{ duration: reduceMotion ? 0 : 0.16, ease: [0.16, 1, 0.3, 1] }}
                >
                  {filter.label}
                  <X aria-hidden="true" size={14} />
                </motion.button>
              ))}
              </AnimatePresence>
            </div>
          ) : null}

          {listingPage.content.length > 0 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence mode="popLayout">
                {listingPage.content.map((listing) => (
                  <MarketListingCard key={listing.id} listing={listing} returnHref={buildHref(filters)} />
                ))}
                </AnimatePresence>
              </div>
              {listingPage.totalPages > 1 ? (
                <div className="mt-8 flex items-center justify-center gap-3">
                  <Button
                    disabled={listingPage.number <= 0}
                    type="button"
                    variant="secondary"
                    onClick={() => goToPage(listingPage.number - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-medium text-ink-700">
                    Page {listingPage.number + 1} of {listingPage.totalPages}
                  </span>
                  <Button
                    disabled={listingPage.number + 1 >= listingPage.totalPages}
                    type="button"
                    variant="secondary"
                    onClick={() => goToPage(listingPage.number + 1)}
                  >
                    Next
                  </Button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center">
              <h2 className="font-editorial text-4xl text-ink-900">No listings match these filters</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-ink-700">Widen the region or include both sale and surplus stock to see more supply.</p>
              <Button className="mt-5" type="button" onClick={resetFilters}>
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {mobileFiltersOpen ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-ink-900/40 lg:hidden"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeMobileFilters();
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Market filters"
          transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            animate={{ x: 0 }}
            className="ml-auto h-full w-[min(88vw,380px)] overflow-y-auto overscroll-contain bg-canvas p-5 shadow-xl"
            exit={{ x: reduceMotion ? 0 : "100%" }}
            initial={{ x: reduceMotion ? 0 : "100%" }}
            transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink-900">Filters</h2>
              <Button ref={closeFiltersRef} className="size-10 px-0" type="button" variant="ghost" onClick={closeMobileFilters} aria-label="Close filters">
                <X aria-hidden="true" size={18} />
              </Button>
            </div>
            {filterControls}
          </motion.div>
        </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
