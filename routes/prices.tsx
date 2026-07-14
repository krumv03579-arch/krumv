import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/prices")({
  head: () => ({ meta: [{ title: "시세 — 딜렉스타" }] }),
  component: () => (
    <ComingSoon
      title="시세"
      description="유니폼 품번별 최근 거래가, 평균 시세, 가격 추이를 확인할 수 있어요."
      icon="📈"
    />
  ),
});