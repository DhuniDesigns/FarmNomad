import Image from "next/image";
import { ProduceVisual } from "./ProduceVisual";
import { cn } from "@/lib/utils";

export function EditorialImage({
  src,
  alt,
  colour,
  label,
  className,
  priority = false
}: {
  src?: string;
  alt: string;
  colour: string;
  label: string;
  className?: string;
  priority?: boolean;
}) {
  if (!src) {
    return <ProduceVisual colour={colour} label={label} className={className} />;
  }

  return (
    <div className={cn("relative overflow-hidden bg-soft", className)}>
      <Image
        alt={alt}
        className="object-cover transition-transform duration-300 ease-[var(--ease-farm-out)] group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        src={src}
      />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-900/45 to-transparent" />
      <div className="absolute left-4 top-4 rounded-md bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink-900 backdrop-blur">
        {label}
      </div>
    </div>
  );
}
