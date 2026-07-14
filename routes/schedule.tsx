import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/schedule")({
  head: () => ({ meta: [{ title: "경기일정 — 딜렉스타" }] }),
  component: () => (
    <ComingSoon
      title="경기일정"
      description="K리그·EPL·UCL·국가대표 등 주요 경기 일정과 라이브스코어를 한눈에."
      icon="📅"
    />
  ),
});