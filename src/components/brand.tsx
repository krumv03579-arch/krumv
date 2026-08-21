import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

/**
 * The deluxla wordmark.
 *
 * The artwork is the supplied PNG, trimmed to its ink so a CSS height means
 * the height of the letters. It is solid black, so dark mode inverts it to
 * white rather than shipping a second file.
 */
export function BrandWordmark({ className }: { className?: string }) {
  return (
    <img
      src="/img/logo-deluxla.png"
      alt="deluxla"
      width={458}
      height={90}
      className={cn("h-7 w-auto dark:invert", className)}
    />
  );
}

export function BrandLogo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="딜렉스타 홈"
      className={cn(
        "flex items-center transition-opacity hover:opacity-80",
        className,
      )}
    >
      <BrandWordmark className="h-[26px]" />
    </Link>
  );
}
