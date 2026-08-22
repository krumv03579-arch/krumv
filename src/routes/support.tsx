import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/page-header";

const FAQ = [
  {
    q: "한국 계좌나 휴대폰 인증이 없어도 주문할 수 있나요?",
    a: "네. 즉시 결제는 해외 카드와 페이팔로 진행되고, 본인인증이 필요한 주문은 수동 구매로 담당자가 대신 처리합니다.",
  },
  {
    q: "상품이 품절되면 어떻게 되나요?",
    a: "결제 금액 전액을 원결제 수단으로 환불합니다. 수수료도 함께 돌려드립니다.",
  },
  {
    q: "여러 스토어에서 산 상품을 한 번에 받을 수 있나요?",
    a: "웨어하우스에 모아 두었다가 합배송으로 보냅니다. 보관은 입고일로부터 1년 무료입니다.",
  },
  {
    q: "배송 중 파손되면 보상받을 수 있나요?",
    a: "입고 검수 사진과 발송 기록을 근거로 배상 절차를 진행합니다. 고가 상품은 보험 옵션을 권장합니다.",
  },
] as const;

// TODO: 실제 고객센터 이메일·전화번호가 정해지면 채워 넣기.
const CHANNELS = [
  { label: "이메일", value: "support@deluxta.com" },
  { label: "운영시간", value: "10:00 AM ~ 6:00 PM (KST), 공휴일 제외" },
] as const;

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "고객지원 — deluxta" },
      {
        name: "description",
        content: "deluxta 이용 중 궁금한 점과 문의 채널을 안내합니다.",
      },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  return (
    <main className="mx-auto w-full max-w-[1460px] px-4 pb-16 pt-8 sm:px-6">
      <PageHeader
        eyebrow="SUPPORT"
        title="고객지원"
        description="주문, 결제, 배송에서 가장 많이 들어오는 질문을 모았습니다."
      />

      <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4">
          {FAQ.map((item) => (
            <section
              key={item.q}
              className="rounded-2xl border border-border/70 bg-card p-7"
            >
              <h2 className="text-[16.5px] font-extrabold tracking-[-0.01em]">
                {item.q}
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                {item.a}
              </p>
            </section>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-border/70 bg-card p-7">
          <h2 className="text-[18px] font-extrabold tracking-[-0.01em]">
            문의 채널
          </h2>
          <dl className="mt-5 space-y-4 text-[14px]">
            {CHANNELS.map((channel) => (
              <div key={channel.label}>
                <dt className="font-bold">{channel.label}</dt>
                <dd className="mt-1 leading-relaxed text-muted-foreground">
                  {channel.value}
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </main>
  );
}
