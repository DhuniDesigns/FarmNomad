"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { demoSeed } from "./seed";
import type { DemoState, DemoUser, Enquiry, Listing, ListingInput, OrderStatus } from "./types";
import { makeId } from "@/lib/utils";
import type { UserRole } from "@/types/auth";

const storageKey = "farmnomad.demo.v1";

function cloneSeed(): DemoState {
  return JSON.parse(JSON.stringify(demoSeed)) as DemoState;
}

function loadState(): DemoState {
  if (typeof window === "undefined") return cloneSeed();

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return cloneSeed();

  try {
    const parsed = JSON.parse(raw) as DemoState;
    const seed = cloneSeed();
    return {
      ...seed,
      ...parsed,
      listings: parsed.listings.map((listing) => {
        const seeded = seed.listings.find((candidate) => candidate.id === listing.id);
        return {
          ...listing,
          imageUrl: listing.imageUrl ?? seeded?.imageUrl ?? defaultImageUrl,
          imageAlt: listing.imageAlt ?? seeded?.imageAlt ?? `${listing.title} produce listing`
        };
      })
    };
  } catch {
    return cloneSeed();
  }
}

const defaultImageUrl = "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80";

function saveState(state: DemoState) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }
}

export function useDemoStore() {
  const [state, setState] = useState<DemoState>(() => cloneSeed());
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  const commit = useCallback((updater: (current: DemoState) => DemoState) => {
    setState((current) => {
      const next = updater(current);
      saveState(next);
      return next;
    });
  }, []);

  const currentUser = useMemo(
    () => state.users.find((user) => user.id === state.sessionUserId) ?? state.users[0],
    [state.sessionUserId, state.users]
  );

  const currentVendor = useMemo(
    () => state.vendors.find((vendor) => vendor.userId === currentUser?.id) ?? state.vendors[0],
    [currentUser?.id, state.vendors]
  );

  const actions = useMemo(() => ({
    loginAs(role: UserRole) {
      commit((current) => {
        const user = current.users.find((candidate) => candidate.role === role) ?? current.users[0];
        return { ...current, sessionUserId: user.id, toast: `Signed in as ${user.name}` };
      });
    },
    registerUser(input: { name: string; email: string; role: "FARMER" | "KITCHEN" | "ORGANISATION" }) {
      commit((current) => {
        const user: DemoUser = {
          id: makeId("user"),
          name: input.name,
          email: input.email,
          role: input.role,
          location: "United Kingdom",
          phone: "",
          organisationStatus: input.role === "ORGANISATION" ? "PENDING" : undefined
        };
        return {
          ...current,
          users: [...current.users, user],
          sessionUserId: user.id,
          toast: `Demo account created for ${input.name}`
        };
      });
    },
    updateProfile(input: Partial<DemoUser>) {
      commit((current) => ({
        ...current,
        users: current.users.map((user) => user.id === current.sessionUserId ? { ...user, ...input } : user),
        toast: "Profile saved"
      }));
    },
    createListing(input: ListingInput) {
      const createdId = makeId("listing");
      commit((current) => {
        const vendor = current.vendors.find((candidate) => candidate.userId === current.sessionUserId) ?? current.vendors[0];
        const listing: Listing = {
          ...input,
          id: createdId,
          vendorId: vendor.id,
          createdAt: new Date().toISOString(),
          views: 0
        };
        return { ...current, listings: [listing, ...current.listings], toast: `${listing.title} published` };
      });
      return createdId;
    },
    updateListing(id: string, input: ListingInput) {
      commit((current) => ({
        ...current,
        listings: current.listings.map((listing) => listing.id === id ? { ...listing, ...input } : listing),
        toast: "Listing saved"
      }));
    },
    archiveListing(id: string) {
      commit((current) => ({
        ...current,
        listings: current.listings.map((listing) => listing.id === id ? { ...listing, status: "ARCHIVED" } : listing),
        toast: "Listing archived"
      }));
    },
    toggleSurplus(id: string) {
      commit((current) => ({
        ...current,
        listings: current.listings.map((listing) => listing.id === id ? { ...listing, surplus: !listing.surplus, pricePence: !listing.surplus ? 0 : listing.pricePence } : listing),
        toast: "Surplus status updated"
      }));
    },
    toggleFavourite(id: string) {
      commit((current) => ({
        ...current,
        favourites: current.favourites.includes(id)
          ? current.favourites.filter((favourite) => favourite !== id)
          : [...current.favourites, id],
        toast: current.favourites.includes(id) ? "Removed from saved listings" : "Saved listing"
      }));
    },
    createEnquiry(input: Omit<Enquiry, "id" | "createdAt">) {
      commit((current) => ({
        ...current,
        enquiries: [{ ...input, id: makeId("enquiry"), createdAt: new Date().toISOString() }, ...current.enquiries],
        orders: [{
          id: makeId("order"),
          listingId: input.listingId,
          vendorId: current.listings.find((listing) => listing.id === input.listingId)?.vendorId ?? current.vendors[0].id,
          buyerName: input.name,
          buyerType: "Organisation",
          quantity: input.quantity,
          status: "PENDING",
          note: input.note,
          createdAt: new Date().toISOString()
        }, ...current.orders],
        toast: "Request sent to the Vendor"
      }));
    },
    updateOrderStatus(id: string, status: OrderStatus) {
      commit((current) => ({
        ...current,
        orders: current.orders.map((order) => order.id === id ? { ...order, status } : order),
        toast: `Order marked ${status.toLowerCase()}`
      }));
    },
    verifyUser(id: string) {
      commit((current) => ({
        ...current,
        users: current.users.map((user) => user.id === id ? { ...user, organisationStatus: "VERIFIED" } : user),
        toast: "Organisation verified"
      }));
    },
    suspendListing(id: string) {
      commit((current) => ({
        ...current,
        listings: current.listings.map((listing) => listing.id === id ? { ...listing, status: "ARCHIVED" } : listing),
        toast: "Listing removed from public market"
      }));
    },
    resetDemo() {
      const seed = cloneSeed();
      saveState(seed);
      setState(seed);
      router.refresh();
    },
    clearToast() {
      commit((current) => ({ ...current, toast: undefined }));
    }
  }), [commit, router]);

  return { state, ready, currentUser, currentVendor, actions };
}

export function getVendorName(state: DemoState, vendorId: string) {
  return state.vendors.find((vendor) => vendor.id === vendorId)?.name ?? "FarmNomad Vendor";
}

export function getListing(state: DemoState, id: string) {
  return state.listings.find((listing) => listing.id === id);
}
