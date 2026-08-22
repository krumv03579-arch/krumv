import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { PageHeader } from "@/components/page-header";

const FLOWS = [
  {
    key: "instant",
    title: "즉시 결제",
    summary: "한국 계좌 없이도 결제 가능",
    detail:
      "해외 카드와 페이팔로 원화 결제를 대신 처리합니다. 결제창에서 막히던 주문을 몇 분 안에 끝낼 수 있어요.",
    steps: [
      "상품 링크와 옵션을 입력",
      "예상 금액(상품가 + 수수료) 확인",
      "해외 카드·페이팔로 결제",
      "주문 완료 알림 수신",
    ],
    fee: "상품가의 5% (최소 $2)",
  },
  {
    key: "manual",
    title: "수동 구매",
    summary: "주문부터 결제까지 대신 처리",
    detail:
      "회원가입, 본인인증, 특전 응모처럼 직접 하기 어려운 절차까지 담당자가 대신 진행합니다.",
    steps: [
      "요청서 작성 (링크·옵션·수량)",
      "담당자 확인 후 견적 발송",
      "견적 결제 시 대리 주문 진행",
      "구매 내역과 영수증 공유",
    ],
    fee: "건당 $5 + 상품가의 5%",
  },
] as const;

export const Route = createFileRoute("/service")({
  head: () => ({
    meta: [
      { title: "서비스 — deluxta" },
      {
        name: "description",
        content:
          "즉시 결제와 수동 구매, 두 가지 방식으로 한국 쇼핑몰 주문을 대신 처리합니다.",
      },
    ],
  }),
  component: ServicePage,
});

function ServicePage() {
  return (
    <main className="mx-auto w-full max-w-[1460px] px-4 pb-16 pt-8 sm:px-6">
      <PageHeader
        eyebrow="SERVICE"
        title="결제와 구매부터 배송까지"
        description="한국 쇼핑몰에서 막히는 지점만 골라 대신 처리합니다. 필요한 방식을 고르세요."
      />

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        {FLOWS.map((flow) => (
          <section
            key={flow.key}
            className="rounded-2xl border border-border/70 bg-card p-7"
          >
            <h2 className="text-[22px] font-extrabold tracking-[-0.02em]">
              {flow.title}
            </h2>
            <p className="mt-1.5 text-[14px] font-semibold text-primary">
              {flow.summary}
            </p>
            <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
              {flow.detail}
            </p>

            <ol className="mt-6 space-y-3">
              {flow.steps.map((step, index) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-[12.5px] font-extrabold">
                    {index + 1}
                  </span>
                  <span className="text-[14px] font-medium">{step}</span>
                </li>
              ))}
            </ol>

            <p className="mt-7 border-t border-border/70 pt-5 text-[13.5px]">
              <span className="font-bold">수수료</span>
              <span className="ml-2 text-muted-foreground">{flow.fee}</span>
            </p>
          </section>
        ))}
      </div>

      <section className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-primary p-8 text-primary-foreground">
        <div>
          <h2 className="text-[22px] font-extrabold tracking-[-0.02em]">
            배송비가 궁금하신가요?
          </h2>
          <p className="mt-2 text-[14px] opacity-90">
            웨어하우스에 모아 두었다가 합배송하면 국가별 요금이 크게 달라집니다.
          </p>
        </div>
        <Link
          to="/warehouse"
          className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-6 py-3 text-[15px] font-bold text-primary transition-colors hover:bg-white"
        >
          배송비 보기
          <ChevronRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
