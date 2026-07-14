import { createFileRoute } from "@tanstack/react-router";
import { HomeDashboard } from "@/components/home-dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "딜렉스타 — 축구 유니폼 마켓 & 커뮤니티" },
      { name: "description", content: "축구 유니폼 거래와 커뮤니티를 한 곳에서. 최신 마켓 상품과 커뮤니티 글을 확인하세요." },
      { property: "og:title", content: "딜렉스타 — 축구 유니폼 마켓 & 커뮤니티" },
      { property: "og:description", content: "축구 유니폼 거래와 커뮤니티를 한 곳에서." },
    ],
  }),
  component: HomeDashboard,
});
