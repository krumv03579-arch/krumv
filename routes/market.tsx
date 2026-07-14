import { createFileRoute } from "@tanstack/react-router";
import { MarketView } from "@/components/market-view";

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "마켓 — 딜렉스타" },
      { name: "description", content: "해외/국내 축구 유니폼을 안전하게 거래하는 딜렉스타 마켓" },
    ],
  }),
  component: () => <MarketView />,
});