import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { ProductCard } from "@/components/shop/product-card";
import { StoreLogo } from "@/components/shop/store-logo";
import { productsByStore, type Store } from "@/lib/shop-data";

/**
 * One store's listings: heading with the store mark on the left, a "더보기"
 * link on the right, and a horizontally scrollable row of products.
 */
export function StoreSection({ store }: { store: Store }) {
  const items = productsByStore(store.key);

  return (
    <section className="border-t border-border/70 pt-10">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/store"
          search={{ store: store.key }}
          className="flex items-center gap-2.5"
        >
          <StoreLogo store={store.key} className={`h-7 ${store.logoClass}`} />
          <h2 className="text-[22px] font-extrabold tracking-[-0.02em]">
            {store.name}
          </h2>
        </Link>
        <Link
          to="/store"
          search={{ store: store.key }}
          className="inline-flex shrink-0 items-center gap-0.5 text-[13.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          더보기
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="-mx-4 mt-6 flex gap-5 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:px-0">
        {items.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            className="w-[168px] shrink-0 sm:w-[200px] lg:w-[230px]"
          />
        ))}
      </div>
    </section>
  );
}
