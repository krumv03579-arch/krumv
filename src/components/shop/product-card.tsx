import { discountRate, usd, type Product } from "@/lib/shop-data";
import { cn } from "@/lib/utils";

/** Single listing tile: square artwork, seller, title, price. */
export function ProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const rate = discountRate(product);

  return (
    <article className={cn("group", className)}>
      <div className="aspect-square overflow-hidden rounded-xl bg-secondary">
        <img
          src={product.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>

      <p className="mt-3 text-[12.5px] text-muted-foreground">
        {product.brand}
      </p>
      <h3 className="mt-1 line-clamp-2-safe min-h-[42px] text-[14px] font-medium leading-[1.45] text-foreground">
        {product.title}
      </h3>

      <div className="mt-2">
        {product.listPrice ? (
          <p className="text-[13px] text-muted-foreground line-through">
            {usd(product.listPrice)}
          </p>
        ) : null}
        <p className="mt-0.5 flex items-baseline gap-1.5">
          {rate ? (
            <span className="text-[16px] font-extrabold text-destructive">
              {rate}%
            </span>
          ) : null}
          <span className="text-[16px] font-extrabold">
            {usd(product.price)}
          </span>
        </p>
      </div>
    </article>
  );
}
