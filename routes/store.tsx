import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/store")({
  head: () => ({ meta: [{ title: "스토어 — 딜렉스타" }] }),
  component: () => (
    <ComingSoon
      title="스토어"
      description="딜렉스타 공식 셀러의 정품 신상 유니폼과 굿즈를 만나보세요."
      icon="🛒"
    />
  ),
});