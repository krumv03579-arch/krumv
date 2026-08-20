import { Link } from "@tanstack/react-router";

import { artistByKey, type ArtistKey } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * Colored artist pill used on trending rows, feed cards and post headers.
 * Renders as a link unless `static` is set (e.g. inside another link).
 */
export function ArtistChip({
  artist,
  size = "sm",
  interactive = true,
  className,
}: {
  artist: ArtistKey;
  size?: "sm" | "md";
  interactive?: boolean;
  className?: string;
}) {
  const meta = artistByKey[artist];
  const classes = cn(
    "inline-flex items-center rounded-md font-extrabold uppercase tracking-wide ring-1 ring-inset",
    size === "sm" ? "px-2 py-1 text-[11px]" : "px-2.5 py-1.5 text-xs",
    meta.chip,
    interactive && "transition-transform hover:-translate-y-px",
    className,
  );

  if (!interactive) return <span className={classes}>{meta.name}</span>;

  return (
    <Link
      to="/artists/$artistId"
      params={{ artistId: meta.key }}
      className={classes}
    >
      {meta.name}
    </Link>
  );
}
