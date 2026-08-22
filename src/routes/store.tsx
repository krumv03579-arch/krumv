import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader } from "@/components/page-header";
import { ProductCard } from "@/components/shop/product-card";
import { StoreLogo } from "@/components/shop/store-logo";
import {
  productsByStore,
  stores,
  storeByKey,
  type StoreKey,
} from "@/lib/shop-data";
import { cn } from "@/lib/utils";

type StoreSearch = { store: StoreKey };

export const Route = createFileRoute("/store")({
  validateSearch: (search: Record<string, unknown>): StoreSearch => {
    const requested = String(search.store ?? "");
    const known = stores.find((store) => store.key === requested);
    return { store: known ? known.key : stores[0].key };
  },
  head: () => ({
    meta: [
      { title: "스토어 — deluxta" },
      {
        name: "description",
        content:
          "올리브영, 번개장터, 팬즈샵, 케이타운포유, 예스24의 상품을 deluxta에서 그대로 주문하세요.",
      },
    ],
  }),
  component: StorePage,
});

function StorePage() {
  const { store: activeKey }: StoreSearch = Route.useSearch();
  const active = storeByKey[activeKey];
  const items = productsByStore(activeKey);

  return (
    <main className="mx-auto w-full max-w-[1460px] px-4 pb-16 pt-8 sm:px-6">
      <PageHeader
        eyebrow="STORE"
        title="한국 쇼핑몰을 그대로 쇼핑하세요"
        description="상품 링크만 붙여 넣으면 deluxta가 대신 주문하고 결제합니다. 아래 스토어는 바로 둘러볼 수 있어요."
      />

      <div className="-mx-4 mt-8 flex gap-2.5 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:px-0">
        {stores.map((store) => (
          <Link
            key={store.key}
            to="/store"
            search={{ store: store.key }}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-[14px] font-bold transition-colors",
              store.key === activeKey
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground/80 hover:bg-secondary",
            )}
          >
            {/* The marks carry their own brand colors, so the active (blue)
                chip puts them back on a white disc to stay legible. */}
            <span
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full",
                store.key === activeKey && "bg-white",
              )}
            >
              <StoreLogo
                store={store.key}
                className={cn("h-4", store.logoClass)}
              />
            </span>
            {store.name}
          </Link>
        ))}
      </div>

      <p className="mt-8 text-[13px] text-muted-foreground">
        {active.blurb} · 상품 {items.length}건
      </p>

      <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
