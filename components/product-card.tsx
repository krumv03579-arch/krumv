import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useState } from "react";
import {
  formatKRW,
  PLACEHOLDER_IMAGE,
  sellerHandle,
  timeAgo,
  type DbProduct,
} from "@/lib/products";

export function ProductCard({ product }: { product: DbProduct }) {
  const [liked, setLiked] = useState(false);
  const image = product.images[0] ?? PLACEHOLDER_IMAGE;
  return (
    <Link
      to="/products/$id"
      params={{ id: product.id }}
      className="group relative block overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={image}
          alt={`${product.team} ${product.size}`}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute left-2 top-2 flex gap-1">
          <span className="rounded-md bg-foreground/85 px-2 py-0.5 text-[11px] font-bold text-background backdrop-blur">
            {product.size}
          </span>
          <span
            className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
              product.condition === "새상품" ? "bg-pitch text-white" : "bg-background/90 text-foreground/80"
            }`}
          >
            {product.condition}
          </span>
        </div>
        <button
          aria-label="관심"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setLiked((v) => !v);
          }}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/90 text-foreground/70 shadow-sm transition hover:text-price"
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-price text-price" : ""}`} />
        </button>
        <div className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-background/95 px-2 py-1 text-sm font-extrabold text-price shadow-sm">
          {formatKRW(product.price)}
        </div>
      </div>
      <div className="space-y-1 p-3">
        <div className="text-[11px] font-semibold text-muted-foreground">{product.team}</div>
        <h3 className="truncate text-sm font-bold text-foreground">{product.title}</h3>
        {product.description && (
          <p className="line-clamp-1 text-xs text-muted-foreground">{product.description}</p>
        )}
        <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
          <span className="truncate">@{sellerHandle(product.user_id)}</span>
          <span className="shrink-0">{timeAgo(product.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}