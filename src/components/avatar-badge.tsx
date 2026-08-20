import { cn } from "@/lib/utils";

const PALETTE = [
  "from-[#ff8ac0] to-[#7b3fe4]",
  "from-[#7b6cff] to-[#22d3ee]",
  "from-[#2fd6a0] to-[#0f766e]",
  "from-[#ffb95e] to-[#e2513c]",
  "from-[#60a5fa] to-[#1e3a8a]",
  "from-[#f472b6] to-[#7c2d63]",
];

/** Deterministic gradient avatar built from the author's name. */
export function AvatarBadge({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const index =
    Array.from(name).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) %
    PALETTE.length;
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-black text-white",
        PALETTE[index],
        size === "sm" && "h-7 w-7 text-[11px]",
        size === "md" && "h-9 w-9 text-[13px]",
        size === "lg" && "h-12 w-12 text-base",
        className,
      )}
    >
      {name.slice(0, 1)}
    </span>
  );
}
