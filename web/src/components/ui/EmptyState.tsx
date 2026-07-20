import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({ title, description, actionHref, actionLabel }: EmptyStateProps) {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-white p-8 text-center">
      <h2 className="text-xl font-semibold text-ink-900">{title}</h2>
      {description ? <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-ink-700">{description}</p> : null}
      {actionHref && actionLabel ? (
        <Link className="mt-5 inline-flex rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white" href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
    </section>
  );
}
