import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, BadgeCheck, Leaf, MapPin, PackageCheck, ShieldCheck, Truck, Wheat } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "FarmNomad | Local food, surplus, and delivery in one network",
  description:
    "FarmNomad connects UK farmers, kitchens, verified organisations, customers, and drivers across one marketplace for produce, surplus redistribution, and fulfilment."
};

const roles = [
  {
    title: "Farmers",
    description: "List fresh produce, move surplus early, and keep orders visible from one web dashboard.",
    icon: Wheat
  },
  {
    title: "Kitchens",
    description: "Publish prepared goods and source local ingredients without juggling separate tools.",
    icon: PackageCheck
  },
  {
    title: "Organisations",
    description: "Receive verified access to donated surplus before good food leaves the local system.",
    icon: ShieldCheck
  },
  {
    title: "Drivers",
    description: "Coordinate marketplace and donation fulfilment as the mobile logistics layer grows.",
    icon: Truck
  }
];

const flow = [
  {
    label: "01",
    title: "Publish what is available",
    description: "Vendors add produce, meals, quantities, pickup windows, and photos to the public market."
  },
  {
    label: "02",
    title: "Route demand to the right outcome",
    description: "Customers buy, kitchens source, and verified organisations claim surplus before spoilage."
  },
  {
    label: "03",
    title: "Keep fulfilment accountable",
    description: "Orders, donations, notifications, and handovers stay attached to the same operating record."
  }
];

const metrics = [
  ["3", "core systems combined"],
  ["6", "role-specific journeys"],
  ["1", "market, donation, delivery loop"]
];

const produce = ["Seasonal veg boxes", "Surplus harvests", "Prepared meals", "Local staples"];

const footerLinks = [
  {
    heading: "Platform",
    links: [
      ["Market", "/market"],
      ["Producers", "/producers"],
      ["Dashboard", "/dashboard"]
    ]
  },
  {
    heading: "Network",
    links: [
      ["Farmers", "/register"],
      ["Kitchens", "/register"],
      ["Organisations", "/register"],
      ["Drivers", "/register"]
    ]
  },
  {
    heading: "MVP focus",
    links: [
      ["Listings", "/market"],
      ["Surplus", "/#surplus"],
      ["Fulfilment", "/#network"]
    ]
  },
  {
    heading: "Account",
    links: [
      ["Create account", "/register"],
      ["Sign in", "/login"]
    ]
  }
];

export default function HomePage() {
  return (
    <>
      <PublicHeader variant="overlay" />
      <main className="bg-canvas text-ink-900">
        <section className="relative isolate min-h-[100svh] overflow-hidden bg-ink-950 text-white">
          <Image
            alt="Aerial view of farmland and a narrow road connecting fields"
            className="fn-hero-media absolute inset-0 -z-20 size-full object-cover"
            fill
            priority
            sizes="100vw"
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2400&q=85"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(7,17,11,0.78),rgba(7,17,11,0.38)_44%,rgba(7,17,11,0.72)),linear-gradient(180deg,rgba(7,17,11,0.48),rgba(7,17,11,0.1)_34%,rgba(7,17,11,0.84))]" />
          <div className="mx-auto flex min-h-[100svh] max-w-[1360px] flex-col justify-end px-5 pb-8 pt-32 lg:px-10 lg:pb-10">
            <div className="max-w-5xl">
              <p className="fn-reveal fn-delay-1 inline-flex items-center gap-2 rounded-full border border-white/24 bg-white/12 px-3 py-2 text-sm font-semibold text-white/88 backdrop-blur">
                <Leaf aria-hidden="true" className="size-4" />
                UK AgriTech marketplace, surplus, and logistics
              </p>
              <h1 className="fn-reveal fn-delay-2 mt-6 max-w-6xl text-[clamp(3.75rem,8vw,8.75rem)] font-semibold leading-[0.9] tracking-normal text-white">
                Move local food before it spoils.
              </h1>
            </div>

            <div className="fn-reveal fn-delay-3 mt-8 grid gap-6 md:grid-cols-[0.6fr_1fr] lg:max-w-5xl">
              <p className="max-w-xs border-l border-white/35 pl-4 text-base font-medium leading-7 text-white/82">
                FarmNomad connects farmers, kitchens, organisations, customers, and drivers across one accountable supply network.
              </p>
              <div>
                <p className="max-w-2xl text-2xl font-semibold leading-9 text-white md:text-3xl">
                  Sell produce, redistribute surplus, and coordinate fulfilment without stitching together marketplaces, charity calls, and ad-hoc couriers.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <ButtonLink href="/market" variant="onDark" className="rounded-full px-6">
                    Browse market
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </ButtonLink>
                  <ButtonLink href="/register" variant="darkGhost" className="rounded-full px-6">
                    Create Vendor account
                  </ButtonLink>
                </div>
              </div>
            </div>

            <div className="fn-reveal fn-delay-4 mt-10 flex flex-col gap-5 border-t border-white/18 pt-6 md:flex-row md:items-end md:justify-between">
              <div className="grid gap-3 sm:grid-cols-3">
                {metrics.map(([value, label]) => (
                  <div className="min-w-36" key={label}>
                    <p className="text-3xl font-semibold text-white">{value}</p>
                    <p className="mt-1 text-sm font-medium text-white/68">{label}</p>
                  </div>
                ))}
              </div>
              <Link className="fn-scroll-cue inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white/82 transition hover:text-white" href="#network">
                Explore the network
                <ArrowDown aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-surface py-5" aria-label="FarmNomad supply categories">
          <div className="mx-auto flex max-w-[1360px] flex-wrap items-center gap-3 px-5 lg:px-10">
            <p className="mr-2 text-sm font-semibold uppercase text-ink-500">Built for</p>
            {produce.map((item) => (
              <span className="rounded-full border border-border bg-canvas px-4 py-2 text-sm font-semibold text-ink-700" key={item}>
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden py-20 lg:py-28" id="network">
          <div className="mx-auto grid max-w-[1360px] gap-12 px-5 lg:grid-cols-[0.82fr_1.18fr] lg:px-10">
            <div>
              <p className="text-sm font-semibold uppercase text-primary-700">One operating layer</p>
              <h2 className="mt-4 max-w-xl text-5xl font-semibold leading-[0.95] text-ink-950 md:text-6xl">
                The platform shape matches the real food chain.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-ink-700">
                FarmNomad is deliberately not another single-purpose farm site. It gives each actor a role-aware surface while keeping listings, surplus, requests, and fulfilment connected.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {roles.map(({ description, icon: Icon, title }) => (
                <article className="fn-lift-card group rounded-lg border border-border bg-surface p-5 shadow-[0_18px_40px_rgba(16,32,24,0.06)] hover:border-brand-border hover:shadow-[0_24px_48px_rgba(16,32,24,0.1)]" key={title}>
                  <div className="flex size-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                    <Icon aria-hidden="true" className="size-5" />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold text-ink-950">{title}</h3>
                  <p className="mt-3 leading-7 text-ink-700">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-field-900 py-20 text-white lg:py-28">
          <div className="mx-auto max-w-[1360px] px-5 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase text-on-dark-subtle">How food moves</p>
                <h2 className="mt-4 max-w-3xl text-5xl font-semibold leading-none md:text-6xl">
                  From field signal to committed handover.
                </h2>
              </div>
              <p className="max-w-2xl text-lg leading-8 text-on-dark-muted">
                The MVP keeps payments out of scope, but it does not treat orders or donations casually. A request is a commitment, and FarmNomad keeps that commitment visible.
              </p>
            </div>

            <div className="mt-14 grid gap-4 lg:grid-cols-3">
              {flow.map((step) => (
                <article className="fn-lift-card relative rounded-lg border border-white/16 bg-white/8 p-6 backdrop-blur hover:bg-white/12" key={step.label}>
                  <span className="text-sm font-semibold text-accent-500">{step.label}</span>
                  <h3 className="mt-8 text-2xl font-semibold">{step.title}</h3>
                  <p className="mt-4 leading-7 text-on-dark-muted">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid bg-surface lg:grid-cols-2" id="surplus">
          <div className="fn-produce-panel relative min-h-[440px] overflow-hidden bg-ink-950">
            <Image
              alt="Fresh vegetables arranged on a green crate"
              className="fn-produce-image size-full object-cover"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              src="/images/farmnomad-auth-still-life.png"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,11,0.02),rgba(7,17,11,0.38))]" />
            <div className="absolute bottom-5 left-5 rounded-lg border border-white/20 bg-black/28 p-4 text-white backdrop-blur md:left-10">
              <p className="text-sm font-semibold text-white/70">Surplus window</p>
              <p className="mt-1 text-3xl font-semibold">Before spoilage</p>
            </div>
          </div>

          <div className="flex items-center px-5 py-16 lg:px-14 lg:py-24">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase text-primary-700">Surplus redistribution</p>
              <h2 className="mt-4 text-5xl font-semibold leading-none text-ink-950 md:text-6xl">
                Good food should have a second route.
              </h2>
              <p className="mt-6 text-lg leading-8 text-ink-700">
                Farmers can mark surplus for donation, verified organisations can receive it, and the platform keeps the donation record tied to the original listing and producer.
              </p>
              <div className="mt-8 grid gap-3">
                {["Verified organisation access", "Donation commitments attached to listings", "A scaling path for driver coordination"].map((item) => (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-canvas p-4 text-sm font-semibold text-ink-900" key={item}>
                    <BadgeCheck aria-hidden="true" className="size-5 text-primary-700" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-[1360px] px-5 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <div>
                <p className="text-sm font-semibold uppercase text-primary-700">Public market</p>
                <h2 className="mt-4 text-5xl font-semibold leading-none text-ink-950 md:text-6xl">
                  Searchable, shareable, ready for rural connections.
                </h2>
                <p className="mt-6 text-lg leading-8 text-ink-700">
                  The public market is designed to show value before sign-up: active listings, vendor context, location, and clear next steps into registration or login.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <ButtonLink href="/market">
                    Browse market
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </ButtonLink>
                  <ButtonLink href="/producers" variant="secondary">
                    Meet producers
                  </ButtonLink>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-surface p-4 shadow-[0_24px_60px_rgba(16,32,24,0.08)]">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <p className="text-sm font-semibold text-ink-500">Live market preview</p>
                    <h3 className="mt-1 text-2xl font-semibold text-ink-950">Lancashire produce board</h3>
                  </div>
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-700">ISR public page</span>
                </div>
                <div className="mt-4 grid gap-3">
                  {[
                    ["Seasonal vegetable box", "Farmer", "Bolton", "32 boxes"],
                    ["Prepared lunch trays", "Kitchen", "Manchester", "18 trays"],
                    ["Donation potatoes", "Farmer", "Preston", "120 kg"]
                  ].map(([title, role, location, quantity]) => (
                    <div className="fn-market-row grid gap-3 rounded-lg border border-border bg-canvas p-4 sm:grid-cols-[1fr_auto] sm:items-center" key={title}>
                      <div>
                        <p className="font-semibold text-ink-950">{title}</p>
                        <p className="mt-1 flex items-center gap-2 text-sm text-ink-500">
                          <MapPin aria-hidden="true" className="size-4" />
                          {location} - {role}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-primary-700">{quantity}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="relative isolate overflow-hidden bg-ink-950 px-5 py-8 text-[#d9ffc0] lg:px-10" id="footer">
          <Image
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-20 size-full object-cover"
            fill
            sizes="100vw"
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2400&q=80"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(7,17,11,0.42),rgba(7,17,11,0.9)),linear-gradient(90deg,rgba(7,17,11,0.9),rgba(7,17,11,0.44),rgba(7,17,11,0.86))]" />

          <div className="mx-auto max-w-[1800px]">
            <p className="fn-footer-word select-none text-[clamp(5rem,20vw,22rem)] font-black leading-[0.72] tracking-normal text-[#c9f89a]">
              FarmNomad
            </p>

            <div className="mt-16 border-t border-[#d9ffc0]/65 pt-7 lg:mt-24">
              <div className="grid gap-10 lg:grid-cols-[1.05fr_1.45fr]">
                <div>
                  <p className="max-w-xl text-4xl font-semibold leading-none text-[#d9ffc0] md:text-5xl">
                    Local food should have a clear route.
                  </p>
                  <p className="mt-5 max-w-md text-base leading-7 text-[#d9ffc0]/74">
                    Built in the UK for farmers, kitchens, organisations, customers, and drivers moving produce before it spoils.
                  </p>
                </div>

                <nav className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4" aria-label="Footer">
                  {footerLinks.map((group) => (
                    <div key={group.heading}>
                      <h2 className="text-xs font-bold uppercase text-[#d9ffc0]/42">{group.heading}</h2>
                      <ul className="mt-4 grid gap-3">
                        {group.links.map(([label, href]) => (
                          <li key={label}>
                            <Link className="fn-footer-link text-sm font-bold uppercase text-[#d9ffc0] transition hover:text-white" href={href}>
                              {label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </nav>
              </div>

              <div className="mt-16 flex flex-col gap-5 text-sm font-semibold text-[#d9ffc0]/78 md:flex-row md:items-end md:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <span>&copy; 2026 FarmNomad. All rights reserved.</span>
                  <span className="hidden text-[#d9ffc0]/38 sm:inline">/</span>
                  <span>Marketplace, surplus, logistics.</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link className="fn-footer-link transition hover:text-white" href="/register">
                    Create account
                  </Link>
                  <Link className="fn-footer-link transition hover:text-white" href="/login">
                    Sign in
                  </Link>
                  <Link className="fn-footer-link transition hover:text-white" href="#">
                    Back to top
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
