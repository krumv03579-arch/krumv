import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

/**
 * The deluxta mark — a parcel in motion, inline so it stays crisp at any size.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("h-8 w-8", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="dx-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5b7bff" />
          <stop offset="1" stopColor="#2f45d8" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#dx-mark)" />
      <path
        d="M20 22h16a10 10 0 0 1 0 20H24v-8h12a2 2 0 0 0 0-4H20a6 6 0 0 1 0-8Z"
        fill="#fff"
      />
      <circle cx="43" cy="24" r="4.5" fill="#9fe8d5" />
    </svg>
  );
}

/** Wordmark lockup used in the header and footer. */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="deluxta 홈"
      className={cn(
        "flex items-center gap-2.5 transition-opacity hover:opacity-80",
        className,
      )}
    >
      <BrandMark className="h-9 w-9" />
      <img
        src="/img/deluxta-logo.png"
        alt="deluxta"
        className="h-[22px] w-auto dark:invert"
      />
    </Link>
  );
}
