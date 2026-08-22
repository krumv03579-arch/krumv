import type { StoreKey } from "@/lib/shop-data";
import { cn } from "@/lib/utils";

/**
 * Store marks are drawn inline rather than loaded as files so the tiles stay
 * crisp at any size and the app ships without third-party logo assets.
 */
function OliveYoungMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
      <circle
        cx="24"
        cy="24"
        r="17"
        fill="none"
        stroke="#8bc53f"
        strokeWidth="5"
      />
      <path
        d="M24 12c6 4 8.5 8 8.5 12S29.5 36 24 36s-8.5-4-8.5-8 2.5-8 8.5-12Z"
        fill="#f26522"
      />
      <path
        d="M24 12c-4 5-4 11 0 24"
        fill="none"
        stroke="#fff"
        strokeWidth="2.5"
      />
    </svg>
  );
}

function BunjangMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
      <path d="M27 6 12 27h9l-3 15 18-22h-9.5L27 6Z" fill="#6b4dff" />
    </svg>
  );
}

function FansShopMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
      <path d="M8 10h11v6h-5v16h5v6H8V10Z" fill="currentColor" />
      <path d="M40 10H29v6h5v16h-5v6h11V10Z" fill="currentColor" />
      <rect x="21" y="21" width="6" height="6" rx="1.5" fill="currentColor" />
    </svg>
  );
}

function Ktown4uMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
      <path d="M9 9h8v30H9z" fill="#1e6bff" />
      <path d="m20 24 14-15h10L30 24l14 15H34L20 24Z" fill="#1e6bff" />
      <path d="m20 24 9-9 4 4-9 9-4-4Z" fill="#4d9bff" />
    </svg>
  );
}

function Yes24Mark() {
  return (
    <svg viewBox="0 0 96 40" className="h-full w-full" aria-hidden="true">
      <text
        x="48"
        y="29"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontWeight="700"
        fontSize="26"
        fill="#0074c8"
      >
        yes24
      </text>
    </svg>
  );
}

const MARKS: Record<StoreKey, () => React.ReactElement> = {
  oliveyoung: OliveYoungMark,
  bunjang: BunjangMark,
  fansshop: FansShopMark,
  ktown4u: Ktown4uMark,
  yes24: Yes24Mark,
};

/**
 * Sized by height only — the yes24 wordmark is wider than it is tall, so the
 * wrapper lets each mark keep its own aspect ratio.
 */
export function StoreLogo({
  store,
  className,
}: {
  store: StoreKey;
  /** Height utility (e.g. `h-6`); width follows the mark's aspect. */
  className?: string;
}) {
  const Mark = MARKS[store];
  return (
    <span
      className={cn(
        "inline-flex h-10 items-center justify-center text-foreground [&>svg]:h-full [&>svg]:w-auto",
        className,
      )}
    >
      <Mark />
    </span>
  );
}
