import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/clubs")({
  head: () => ({ meta: [{ title: "동호회 — 딜렉스타" }] }),
  component: () => (
    <ComingSoon
      title="동호회"
      description="지역·연령별 축구 동호회를 만들고, 멤버를 모집하세요."
      icon="⚽"
    />
  ),
});