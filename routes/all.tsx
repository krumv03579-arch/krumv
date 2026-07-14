import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/all")({
  head: () => ({ meta: [{ title: "전체글 — 딜렉스타" }] }),
  component: () => (
    <ComingSoon
      title="전체글"
      description="커뮤니티·마켓·동호회의 최신 글을 한 곳에서 볼 수 있는 통합 피드입니다."
      icon="📰"
    />
  ),
});