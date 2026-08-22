import { createFileRoute } from "@tanstack/react-router";

import { HeroBanner } from "@/components/shop/hero-banner";
import { ServiceCards } from "@/components/shop/service-cards";
import { StoreRail } from "@/components/shop/store-rail";
import { StoreSection } from "@/components/shop/store-section";
import { stores } from "@/lib/shop-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "deluxta — 한국 쇼핑몰 해외 구매대행" },
      {
        name: "description",
        content:
          "한국 계좌 없이도 결제부터 구매, 웨어하우스 보관과 합배송까지 한 곳에서. 올리브영·번개장터·팬즈샵·케이타운포유·예스24를 그대로 쇼핑하세요.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <main className="mx-auto w-full max-w-[1460px] px-4 pb-8 pt-6 sm:px-6">
      <StoreRail />

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,530px)]">
        <HeroBanner />
        <ServiceCards />
      </div>

      <div className="mt-12 flex flex-col gap-12">
        {stores.map((store) => (
          <StoreSection key={store.key} store={store} />
        ))}
      </div>
    </main>
  );
}
