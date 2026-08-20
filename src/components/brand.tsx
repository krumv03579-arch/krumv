import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

/** The pulseroom sparkle mark — inline so it inherits crisp rendering at any size. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("h-8 w-8", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pr-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff6f91" />
          <stop offset="0.55" stopColor="#ff4d6d" />
          <stop offset="1" stopColor="#7c4dff" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#pr-mark)" />
      <path
        d="M32 13.5c1.4 6.6 4.4 9.6 11 11-6.6 1.4-9.6 4.4-11 11-1.4-6.6-4.4-9.6-11-11 6.6-1.4 9.6-4.4 11-11Z"
        fill="#fff"
      />
      <path
        d="M20.5 38.5c.8 3.6 2.4 5.2 6 6-3.6.8-5.2 2.4-6 6-.8-3.6-2.4-5.2-6-6 3.6-.8 5.2-2.4 6-6Z"
        fill="#fff"
        fillOpacity="0.85"
      />
    </svg>
  );
}

export function BrandLogo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="pulseroom 홈"
      className={cn(
        "flex items-center gap-2.5 transition-opacity hover:opacity-80",
        className,
      )}
    >
      <BrandMark />
      <span className="text-[22px] font-extrabold leading-none tracking-[-0.02em] text-foreground">
        pulseroom
      </span>
    </Link>
  );
}
