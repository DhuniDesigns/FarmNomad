"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ListingCard } from "./ListingCard";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/Field";
import { Toast } from "@/components/ui/Toast";
import { filterListings, type MarketFilters } from "@/lib/demo/filter";
import { useDemoStore } from "@/lib/demo/store";
import type { ListingCategory } from "@/lib/demo/types";

const categories: Array<ListingCategory | "all"> = ["all", "Vegetables", "Fruit", "Dairy", "Bakery", "Prepared food", "Herbs"];
const regions = ["all", "Lancashire", "Greater Manchester", "Yorkshire"];

export function MarketExperience() {
  const { state, ready, actions } = useDemoStore();
  const [filters, setFilters] = useState<MarketFilters>({
    q: "",
    category: "all",
    region: "all",
    supply: "all",
    sort: "newest"
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const closeFiltersRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  const listings = useMemo(() => filterListings(state.listings, filters), [filters, state.listings]);
  const surplusKg = state.listings.filter((listing) => listing.surplus && listing.status === "ACTIVE").reduce((sum, listing) => sum + listing.quantity, 0);
  const visibleListings = listings.slice(0, visibleCount);
  const activeFilters = [
    filters.q ? { key: "q" as const, label: `Search: ${filters.q}` } : null,
    filters.category !== "all" ? { key: "category" as const, label: filters.category } : null,
    filters.region !== "all" ? { key: "region" as const, label: filters.region } : null,
    filters.supply !== "all" ? { key: "supply" as const, label: filters.supply === "surplus" ? "Surplus only" : filters.supply === "sale" ? "Sale listings" : "Organic" } : null
  ].filter(Boolean) as Array<{ key: keyof MarketFilters; label: string }>;

  useEffect(() => {
    setVisibleCount(6);
  }, [filters]);

  useEffect(() => {
    if (!mobileFiltersOpen) return;
    closeFiltersRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileFiltersOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileFiltersOpen]);

  function updateFilter(key: keyof MarketFilters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function clearFilter(key: keyof MarketFilters) {
    setFilters((current) => ({ ...current, [key]: key === "q" ? "" : "all" }));
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
        <option value="all">Sale and surplus</option>
        <option value="surplus">Surplus only</option>
        <option value="sale">Sale listings</option>
        <option value="organic">Organic</option>
      </SelectField>
      <SelectField label="Sort" value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value)}>
        <option value="newest">Newest first</option>
        <option value="price-asc">Lowest price</option>
        <option value="distance">Nearest first</option>
        <option value="quantity">Largest lots</option>
      </SelectField>
      <Button type="button" variant="secondary" onClick={() => setFilters({ q: "", category: "all", region: "all", supply: "all", sort: "newest" })}>
        Reset filters
      </Button>
    </div>
  );

  return (
    <main className="min-h-screen bg-canvas">
      <Toast message={state.toast} onClear={actions.clearToast} />
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
            <form className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-[1fr_auto]" onSubmit={(event) => event.preventDefault()}>
              <TextField
                aria-label="Search listings"
                className="w-full"
                label="Search"
                placeholder="Search apples, carrots, sourdough…"
                value={filters.q}
                onChange={(event) => updateFilter("q", event.target.value)}
              />
              <Button className="sm:mt-6" type="submit">
                <Search aria-hidden="true" size={18} /> Search
              </Button>
            </form>
          </div>
          <aside className="self-end rounded-2xl border border-border bg-[#17231B] p-6 text-white shadow-[0_22px_60px_rgba(23,35,27,0.18)]">
            <p className="text-sm font-semibold text-[#b7d7bc]">Pilot stock board</p>
            <dl className="mt-5 grid grid-cols-3 gap-3">
              <div>
                <dt className="text-xs text-[#b7d7bc]">Active lots</dt>
                <dd className="text-2xl font-semibold">{state.listings.filter((listing) => listing.status === "ACTIVE").length}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#b7d7bc]">Surplus qty</dt>
                <dd className="text-2xl font-semibold">{surplusKg}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#b7d7bc]">Regions</dt>
                <dd className="text-2xl font-semibold">3</dd>
              </div>
            </dl>
            <p className="mt-5 text-sm leading-6 text-[#dceade]">Demo changes persist in this browser. Use Dashboard to create stock and see it appear here.</p>
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
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink-700">{ready ? `${listings.length} listings match your board` : "Loading listings…"}</p>
            <Button className="lg:hidden" type="button" variant="secondary" onClick={() => setMobileFiltersOpen(true)}>
              <SlidersHorizontal aria-hidden="true" size={18} /> Filters
            </Button>
          </div>

          {activeFilters.length > 0 ? (
            <div className="mb-5 flex flex-wrap gap-2" aria-label="Active filters">
              {activeFilters.map((filter) => (
                <motion.button
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-ink-700 transition-colors duration-150 ease-[var(--ease-farm-out)] hover:border-sage hover:bg-soft"
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
            </div>
          ) : null}

          {!ready ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading listings">
              {Array.from({ length: 6 }).map((_, index) => (
                <div className="overflow-hidden rounded-xl border border-border bg-white" key={index}>
                  <div className="aspect-[4/3] animate-pulse bg-soft" />
                  <div className="grid gap-3 p-5">
                    <div className="h-4 w-20 animate-pulse rounded bg-soft" />
                    <div className="h-6 w-3/4 animate-pulse rounded bg-soft" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-soft" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence mode="popLayout">
                {visibleListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    state={state}
                    favourite={state.favourites.includes(listing.id)}
                    onToggleFavourite={actions.toggleFavourite}
                  />
                ))}
                </AnimatePresence>
              </div>
              {visibleCount < listings.length ? (
                <div className="mt-8 flex justify-center">
                  <Button type="button" variant="secondary" onClick={() => setVisibleCount((count) => count + 6)}>
                    Load more listings
                  </Button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center">
              <h2 className="font-editorial text-4xl text-ink-900">No listings match these filters</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-ink-700">Widen the region or include both sale and surplus stock to see more supply.</p>
              <Button className="mt-5" type="button" onClick={() => setFilters({ q: "", category: "all", region: "all", supply: "all", sort: "newest" })}>
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
            if (event.target === event.currentTarget) setMobileFiltersOpen(false);
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
              <Button ref={closeFiltersRef} className="size-10 px-0" type="button" variant="ghost" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
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
