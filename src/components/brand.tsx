import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

/**
 * The deluxla wordmark, drawn rather than typeset so it renders identically
 * without waiting on a webfont.
 *
 * The letters sit on one geometric grid: a 150 unit cap height, a 100 unit
 * x-height, bowls of the same 66 unit diameter and a 34 unit stroke throughout.
 * The x is two filled quadrilaterals instead of stroked diagonals, because butt
 * caps on a diagonal would hang below the baseline.
 */
export function BrandWordmark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 619 150"
      className={cn("h-7 w-auto", className)}
      role="img"
      aria-label="deluxla"
      fill="none"
    >
      <g
        stroke="currentColor"
        strokeWidth="34"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      >
        {/* d */}
        <circle cx="50" cy="100" r="33" />
        <path d="M83 0V150" />
        {/* e — the bowl breaks at the lower right, and the bar closes it */}
        <path d="M191 100A33 33 0 0 0 125 100A33 33 0 0 0 179.21 125.28" />
        <path d="M125 100H191" />
        {/* l */}
        <path d="M233 0V150" />
        {/* u */}
        <path d="M275 50V100A33 33 0 0 0 341 100V50" />
        {/* l */}
        <path d="M493.7 0V150" />
        {/* a */}
        <circle cx="569" cy="100" r="33" />
        <path d="M602 50V150" />
      </g>
      {/* x */}
      <g fill="currentColor">
        <path d="M366 50H406.7L472.7 150H432Z" />
        <path d="M472.7 50H432L366 150H406.7Z" />
      </g>
    </svg>
  );
}

export function BrandLogo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="deluxla 홈"
      className={cn(
        "flex items-center transition-opacity hover:opacity-80",
        className,
      )}
    >
      <BrandWordmark className="h-[26px]" />
    </Link>
  );
}
