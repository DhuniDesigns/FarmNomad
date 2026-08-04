"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { z } from "zod";
import { BackLink } from "@/components/ui/BackLink";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { useCreateListingMutation, useMyListingsQuery, useUpdateListingMutation } from "@/lib/api/listingsApi";
import { extractApiErrorMessage } from "@/lib/api/errorMessage";
import { revalidateMarket } from "@/lib/api/revalidateMarket";
import { triggerHaptic } from "@/lib/interactions";
import type { ListingMutationInput } from "@/types/listing";

// Matches the filterable values on /market (MarketExperience.tsx) so a
// published listing is actually reachable through the public browse filters.
const categories = ["Vegetables", "Fruit", "Dairy", "Bakery", "Prepared food", "Herbs"];
const locations = ["Lancashire", "Greater Manchester", "Yorkshire"];
const units = ["kg", "box", "crate", "tray", "case", "bundle"];

/**
 * Real backend fields only (ListingRequest on the API side). The old demo
 * form also had harvestDate/bestBefore/handling/collectionWindow/organic/
 * region+postcode+distanceMiles/image fields — none of those have a column
 * on `listings` yet (images were explicitly deferred this pass; the rest
 * are tracked as gaps in docs/DECISIONS.md). Re-add here if/when the schema
 * grows to support them.
 */
const listingSchema = z.object({
  title: z.string().min(3, "Use a clear listing title."),
  category: z.enum(["Vegetables", "Fruit", "Dairy", "Bakery", "Prepared food", "Herbs"]),
  description: z.string().min(20, "Add enough detail for buyers to decide."),
  pricePence: z.number().min(0),
  quantity: z.number().min(0, "Quantity can't be negative."),
  unit: z.enum(["kg", "box", "crate", "tray", "case", "bundle"]),
  location: z.string().min(2),
  surplus: z.boolean()
});

type FormState = z.infer<typeof listingSchema>;

const defaultInput: FormState = {
  title: "",
  category: "Vegetables",
  description: "",
  pricePence: 1200,
  quantity: 10,
  unit: "crate",
  location: "Lancashire",
  surplus: false
};

export function ListingForm({ id }: { id?: string }) {
  const router = useRouter();
  const { data: mine, isLoading: loadingMine } = useMyListingsQuery(undefined, { skip: !id });
  const existing = id ? mine?.find((listing) => listing.id === id) : undefined;
  const [createListing] = useCreateListingMutation();
  const [updateListing] = useUpdateListingMutation();

  const [form, setForm] = useState<FormState>(defaultInput);
  const initialFormRef = useRef<FormState>(defaultInput);
  const hydratedRef = useRef(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingNavigationHref, setPendingNavigationHref] = useState<string | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const reduceMotion = useReducedMotion();

  // The form starts empty (or with defaults) and hydrates once "mine" loads
  // and the matching listing is found — there's no single-listing
  // authenticated GET, so editing reuses the already-fetched "mine" list.
  useEffect(() => {
    if (!id || hydratedRef.current || !existing) return;
    const hydrated: FormState = {
      title: existing.title,
      category: categories.includes(existing.category) ? (existing.category as FormState["category"]) : "Vegetables",
      description: existing.description,
      pricePence: existing.pricePence,
      quantity: existing.quantity,
      unit: units.includes(existing.unit) ? (existing.unit as FormState["unit"]) : "crate",
      location: existing.location,
      surplus: existing.surplus
    };
    setForm(hydrated);
    initialFormRef.current = hydrated;
    hydratedRef.current = true;
  }, [id, existing]);

  const heading = id ? "Edit listing" : "Create listing";
  const submitLabel = id ? "Save listing" : "Publish listing";
  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initialFormRef.current), [form]);

  useEffect(() => {
    if (!isDirty) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  function setValue<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit() {
    setSubmitting(true);
    const parsed = listingSchema.safeParse(form);
    if (!parsed.success) {
      setSubmitting(false);
      setError(parsed.error.issues[0]?.message ?? "Check the listing details.");
      triggerHaptic("error");
      window.requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }

    const body: ListingMutationInput = parsed.data;

    try {
      if (id) {
        await updateListing({ id, body }).unwrap();
        triggerHaptic("success");
        void revalidateMarket(id);
        router.push("/listings");
      } else {
        const created = await createListing(body).unwrap();
        triggerHaptic("success");
        void revalidateMarket(created.id);
        router.push(`/market/${created.id}`);
      }
    } catch (submitError) {
      setSubmitting(false);
      setError(extractApiErrorMessage(submitError, "Couldn't save the listing. Try again."));
      triggerHaptic("error");
      window.requestAnimationFrame(() => errorRef.current?.focus());
    }
  }

  function attemptNavigation(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (!isDirty) return;
    event.preventDefault();
    setPendingNavigationHref(href);
  }

  function leaveForm() {
    const href = pendingNavigationHref ?? "/listings";
    setPendingNavigationHref(null);
    router.push(href);
  }

  function cancelForm() {
    if (isDirty) {
      setPendingNavigationHref("/listings");
      return;
    }
    router.push("/listings");
  }

  if (id && loadingMine && !hydratedRef.current) {
    return (
      <main className="mx-auto max-w-[1280px] px-5 py-8 lg:px-8">
        <p className="text-sm font-semibold text-ink-500">Loading listing…</p>
      </main>
    );
  }

  if (id && !loadingMine && !existing) {
    return (
      <main className="mx-auto max-w-[1280px] px-5 py-8 lg:px-8">
        <BackLink href="/listings" label="Back to listings" fallbackHref="/listings" />
        <p className="mt-5 text-sm font-semibold text-ink-700">
          That listing isn&apos;t in your account — it may have been removed, or it belongs to someone else.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 lg:px-8">
      <div className="mb-7">
        <BackLink href="/listings" label="Back to listings" fallbackHref="/listings" onNavigateAttempt={attemptNavigation} />
        <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-primary-700">Vendor listing</p>
        <h1 className="font-editorial mt-2 text-5xl leading-none text-ink-900 md:text-6xl">{heading}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-ink-700">
          Describe the lot and set a clear price and quantity before publishing into the public market.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="grid gap-6 rounded-2xl border border-border bg-white p-5 shadow-[0_1px_18px_rgba(23,35,27,0.04)] md:p-6">
          <FormSection title="Lot basics" description="Use buyer-facing language and avoid internal shorthand.">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Title" value={form.title} onChange={(event) => setValue("title", event.target.value)} />
              <SelectField label="Category" value={form.category} onChange={(event) => setValue("category", event.target.value as FormState["category"])}>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </SelectField>
            </div>
            <TextAreaField label="Description" value={form.description} onChange={(event) => setValue("description", event.target.value)} />
          </FormSection>

          <FormSection title="Availability and pricing">
            <div className="grid gap-4 md:grid-cols-3">
              <TextField label="Price in pence" type="number" min="0" value={form.pricePence} onChange={(event) => setValue("pricePence", Number(event.target.value))} />
              <TextField label="Quantity" type="number" min="0" value={form.quantity} onChange={(event) => setValue("quantity", Number(event.target.value))} />
              <SelectField label="Unit" value={form.unit} onChange={(event) => setValue("unit", event.target.value as FormState["unit"])}>
                {units.map((unit) => <option key={unit}>{unit}</option>)}
              </SelectField>
            </div>
          </FormSection>

          <FormSection title="Collection details">
            <SelectField label="Region" value={form.location} onChange={(event) => setValue("location", event.target.value)}>
              {locations.map((location) => <option key={location}>{location}</option>)}
            </SelectField>
            <label className="flex min-h-12 items-center gap-3 rounded-lg border border-border px-3 text-sm font-semibold text-ink-900 transition-[background-color,border-color,box-shadow] duration-150 ease-[var(--ease-farm-out)] hover:border-primary-600 hover:bg-primary-50 focus-within:ring-3 focus-within:ring-primary-600/30">
              <input type="checkbox" checked={form.surplus} onChange={(event) => {
                triggerHaptic("selection");
                setValue("surplus", event.target.checked);
              }} />
              Surplus or donation listing
            </label>
          </FormSection>

          {error ? (
            <motion.p
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: [0, -4, 4, -2, 0] }}
              className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-danger-600"
              initial={{ opacity: 0 }}
              ref={errorRef}
              role="alert"
              tabIndex={-1}
              transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              {error}
            </motion.p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button type="button" loading={submitting} loadingLabel={id ? "Saving..." : "Publishing..."} onClick={submit}>{submitLabel}</Button>
            <Button type="button" variant="secondary" onClick={() => {
              triggerHaptic("selection");
              cancelForm();
            }}>Cancel</Button>
          </div>
        </section>

        <aside className="sticky top-24 h-fit overflow-hidden rounded-2xl border border-border bg-white shadow-[0_1px_18px_rgba(23,35,27,0.04)]">
          <div className="p-4">
            <p className="text-lg font-semibold text-ink-900">{form.title || "Listing preview"}</p>
            <p className="mt-1 text-sm text-ink-700">{form.quantity} {form.unit} - {form.location}</p>
            <p className="mt-3 text-sm leading-6 text-ink-500">
              Photos aren&apos;t wired up yet — this listing will show without an image on the public market until that lands.
            </p>
          </div>
        </aside>
      </div>
      <ConfirmDialog
        confirmLabel="Leave form"
        description="Your listing changes have not been saved. Leave this form and discard the draft?"
        destructive
        onCancel={() => setPendingNavigationHref(null)}
        onConfirm={leaveForm}
        open={Boolean(pendingNavigationHref)}
        title="Discard listing changes?"
      />
    </main>
  );
}

function FormSection({ children, description, title }: { children: React.ReactNode; description?: string; title: string }) {
  return (
    <section className="grid gap-4 border-b border-border pb-6 last:border-b-0 last:pb-0">
      <div>
        <h2 className="text-xl font-semibold text-ink-900">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-ink-700">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
