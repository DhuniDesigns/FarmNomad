"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { z } from "zod";
import { BackLink } from "@/components/ui/BackLink";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { getListing, useDemoStore } from "@/lib/demo/store";
import { triggerHaptic } from "@/lib/interactions";
import type { ListingCategory, ListingInput, ListingStatus } from "@/lib/demo/types";

const listingSchema = z.object({
  title: z.string().min(3, "Use a clear listing title."),
  category: z.enum(["Vegetables", "Fruit", "Dairy", "Bakery", "Prepared food", "Herbs"]),
  description: z.string().min(20, "Add enough detail for buyers to decide."),
  pricePence: z.number().min(0),
  quantity: z.number().positive("Quantity must be greater than zero."),
  unit: z.enum(["kg", "box", "crate", "tray", "case", "bundle"]),
  region: z.string().min(2),
  postcode: z.string().min(2),
  distanceMiles: z.number().min(0),
  surplus: z.boolean(),
  organic: z.boolean(),
  status: z.enum(["DRAFT", "ACTIVE", "SOLD_OUT", "EXPIRED", "ARCHIVED"]),
  harvestDate: z.string().min(1),
  bestBefore: z.string().min(1),
  handling: z.string().min(8),
  collectionWindow: z.string().min(4),
  colour: z.string().min(4),
  imageLabel: z.string().min(3),
  imageUrl: z.string().url("Use a valid image URL."),
  imageAlt: z.string().min(8, "Describe the listing image.")
});

const defaultInput: ListingInput = {
  title: "",
  category: "Vegetables",
  description: "",
  pricePence: 1200,
  quantity: 10,
  unit: "crate",
  region: "Lancashire",
  postcode: "PR3",
  distanceMiles: 8,
  surplus: false,
  organic: false,
  status: "ACTIVE",
  harvestDate: "2026-07-20",
  bestBefore: "2026-07-27",
  handling: "Keep cool and collect within the agreed window.",
  collectionWindow: "Mon-Fri, 08:00-15:00",
  colour: "#2D7D46",
  imageLabel: "Produce lot",
  imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
  imageAlt: "Fresh produce harvested for a local market"
};

export function ListingForm({ id }: { id?: string }) {
  const router = useRouter();
  const { state, actions } = useDemoStore();
  const existing = id ? getListing(state, id) : undefined;
  const [form, setForm] = useState<ListingInput>(() => existing ? { ...existing } : defaultInput);
  const initialFormRef = useRef<ListingInput>(existing ? { ...existing } : defaultInput);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingNavigationHref, setPendingNavigationHref] = useState<string | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const reduceMotion = useReducedMotion();

  const heading = id ? "Edit listing" : "Create listing";
  const submitLabel = id ? "Save listing" : "Publish listing";
  const preview = useMemo(() => form.imageLabel || form.title || "Produce lot", [form.imageLabel, form.title]);
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

  function setValue<K extends keyof ListingInput>(key: K, value: ListingInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit() {
    setSubmitting(true);
    const parsed = listingSchema.safeParse(form);
    if (!parsed.success) {
      setSubmitting(false);
      setError(parsed.error.issues[0]?.message ?? "Check the listing details.");
      triggerHaptic("error");
      window.requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    triggerHaptic("success");
    if (id) {
      actions.updateListing(id, parsed.data);
      router.push("/listings");
    } else {
      const createdId = actions.createListing(parsed.data);
      router.push(`/market/${createdId}`);
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

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 lg:px-8">
      <div className="mb-7">
        <BackLink href="/listings" label="Back to listings" fallbackHref="/listings" onNavigateAttempt={attemptNavigation} />
        <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-primary-700">Vendor listing</p>
        <h1 className="font-editorial mt-2 text-5xl leading-none text-ink-900 md:text-6xl">{heading}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-ink-700">
          Describe the lot, set a clear collection window, and publish into the public market.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="grid gap-6 rounded-2xl border border-border bg-white p-5 shadow-[0_1px_18px_rgba(23,35,27,0.04)] md:p-6">
          <FormSection title="Lot basics" description="Use buyer-facing language and avoid internal shorthand.">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Title" value={form.title} onChange={(event) => setValue("title", event.target.value)} />
              <SelectField label="Category" value={form.category} onChange={(event) => setValue("category", event.target.value as ListingCategory)}>
                {["Vegetables", "Fruit", "Dairy", "Bakery", "Prepared food", "Herbs"].map((category) => <option key={category}>{category}</option>)}
              </SelectField>
            </div>
            <TextAreaField label="Description" value={form.description} onChange={(event) => setValue("description", event.target.value)} />
          </FormSection>

          <FormSection title="Availability and pricing">
            <div className="grid gap-4 md:grid-cols-4">
              <TextField label="Price in pence" type="number" min="0" value={form.pricePence} onChange={(event) => setValue("pricePence", Number(event.target.value))} />
              <TextField label="Quantity" type="number" min="1" value={form.quantity} onChange={(event) => setValue("quantity", Number(event.target.value))} />
              <SelectField label="Unit" value={form.unit} onChange={(event) => setValue("unit", event.target.value as ListingInput["unit"])}>
                {["kg", "box", "crate", "tray", "case", "bundle"].map((unit) => <option key={unit}>{unit}</option>)}
              </SelectField>
              <SelectField label="Status" value={form.status} onChange={(event) => setValue("status", event.target.value as ListingStatus)}>
                {["DRAFT", "ACTIVE", "SOLD_OUT", "EXPIRED", "ARCHIVED"].map((status) => <option key={status}>{status}</option>)}
              </SelectField>
            </div>
          </FormSection>

          <FormSection title="Collection details">
            <div className="grid gap-4 md:grid-cols-3">
              <TextField label="Region" value={form.region} onChange={(event) => setValue("region", event.target.value)} />
              <TextField label="Postcode" value={form.postcode} onChange={(event) => setValue("postcode", event.target.value)} />
              <TextField label="Distance miles" type="number" min="0" value={form.distanceMiles} onChange={(event) => setValue("distanceMiles", Number(event.target.value))} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Harvest date" type="date" value={form.harvestDate} onChange={(event) => setValue("harvestDate", event.target.value)} />
              <TextField label="Best before" type="date" value={form.bestBefore} onChange={(event) => setValue("bestBefore", event.target.value)} />
            </div>
            <TextField label="Collection window" value={form.collectionWindow} onChange={(event) => setValue("collectionWindow", event.target.value)} />
            <TextAreaField label="Handling notes" value={form.handling} onChange={(event) => setValue("handling", event.target.value)} />
          </FormSection>

          <FormSection title="Image and flags">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Image label" value={form.imageLabel} onChange={(event) => setValue("imageLabel", event.target.value)} />
              <TextField label="Image URL" value={form.imageUrl} onChange={(event) => setValue("imageUrl", event.target.value)} />
            </div>
            <TextField label="Image alt text" value={form.imageAlt} onChange={(event) => setValue("imageAlt", event.target.value)} />
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex min-h-12 items-center gap-3 rounded-lg border border-border px-3 text-sm font-semibold text-ink-900 transition-[background-color,border-color,box-shadow] duration-150 ease-[var(--ease-farm-out)] hover:border-primary-600 hover:bg-primary-50 focus-within:ring-3 focus-within:ring-primary-600/30">
                <input type="checkbox" checked={form.surplus} onChange={(event) => {
                  triggerHaptic("selection");
                  setValue("surplus", event.target.checked);
                }} />
                Surplus or donation listing
              </label>
              <label className="flex min-h-12 items-center gap-3 rounded-lg border border-border px-3 text-sm font-semibold text-ink-900 transition-[background-color,border-color,box-shadow] duration-150 ease-[var(--ease-farm-out)] hover:border-primary-600 hover:bg-primary-50 focus-within:ring-3 focus-within:ring-primary-600/30">
                <input type="checkbox" checked={form.organic} onChange={(event) => {
                  triggerHaptic("selection");
                  setValue("organic", event.target.checked);
                }} />
                Organic
              </label>
            </div>
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
          <EditorialImage alt={form.imageAlt || preview} className="aspect-[4/3]" colour={form.colour} label={preview} priority src={form.imageUrl} />
          <div className="p-4">
            <p className="text-lg font-semibold text-ink-900">{form.title || "Listing preview"}</p>
            <p className="mt-1 text-sm text-ink-700">{form.quantity} {form.unit} - {form.region}</p>
            <p className="mt-3 text-sm leading-6 text-ink-500">This is how the listing image and core availability details will read on the public market.</p>
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
