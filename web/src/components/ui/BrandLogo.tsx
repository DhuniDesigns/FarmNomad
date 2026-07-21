import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  href?: string;
  label?: string;
  priority?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
};

const sizes = {
  sm: "h-9 w-[132px]",
  md: "h-11 w-[161px]",
  lg: "h-14 w-[205px]"
};

export function BrandLogo({ className, href, label = "FarmNomad", priority = false, size = "md", variant = "dark" }: BrandLogoProps) {
  const image = (
    <Image
      alt={href ? "" : label}
      className="h-full w-full object-contain"
      height={180}
      priority={priority}
      sizes={size === "lg" ? "205px" : size === "md" ? "161px" : "132px"}
      src={variant === "light" ? "/images/farmnomad-logo-light.png" : "/images/farmnomad-logo-dark.png"}
      width={660}
    />
  );

  if (href) {
    return (
      <Link aria-label={label} className={cn("inline-flex min-h-11 shrink-0 items-center rounded-lg focus-visible:ring-3 focus-visible:ring-primary-600/30", sizes[size], className)} href={href}>
        {image}
      </Link>
    );
  }

  return <span className={cn("inline-flex shrink-0 items-center", sizes[size], className)}>{image}</span>;
}
