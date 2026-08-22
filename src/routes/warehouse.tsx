import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/page-header";

const BENEFITS = [
  {
    title: "1년 무료 보관",
    body: "도착한 상품은 입고일로부터 12개월 동안 무료로 보관합니다. 컴백·발매 일정에 맞춰 천천히 모으세요.",
  },
  {
    title: "합배송",
    body: "여러 스토어에서 산 상품을 한 상자에 담아 보냅니다. 박스 수가 줄어드는 만큼 배송비가 내려갑니다.",
  },
  {
    title: "무료 검수 사진",
    body: "입고 시 실물 사진을 찍어 올려 드립니다. 파손·오배송을 발송 전에 확인할 수 있어요.",
  },
] as const;

const RATES = [
  { country: "미국", days: "5-8일", first: "$14.90", extra: "$4.20" },
  { country: "일본", days: "2-4일", first: "$9.60", extra: "$2.80" },
  { country: "싱가포르", days: "4-6일", first: "$12.40", extra: "$3.60" },
  { country: "독일", days: "6-10일", first: "$17.80", extra: "$5.10" },
  { country: "호주", days: "6-9일", first: "$16.20", extra: "$4.80" },
] as const;

export const Route = createFileRoute("/warehouse")({
  head: () => ({
    meta: [
      { title: "웨어하우스 — deluxta" },
      {
        name: "description",
        content:
          "1년 무료 보관과 합배송. 여러 스토어의 상품을 한 상자에 모아 전 세계로 보냅니다.",
      },
    ],
  }),
  component: WarehousePage,
});

function WarehousePage() {
  return (
    <main className="mx-auto w-full max-w-[1460px] px-4 pb-16 pt-8 sm:px-6">
      <PageHeader
        eyebrow="WAREHOUSE"
        title="1년 무료 보관, 합배송으로 전 세계 배송"
        description="부천 물류센터에 도착한 상품을 모아 두었다가 원하는 시점에 한 번에 보냅니다."
      />

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {BENEFITS.map((benefit) => (
          <section
            key={benefit.title}
            className="rounded-2xl border border-border/70 bg-card p-7"
          >
            <h2 className="text-[18px] font-extrabold tracking-[-0.01em]">
              {benefit.title}
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
              {benefit.body}
            </p>
          </section>
        ))}
      </div>

      <section className="mt-10 overflow-hidden rounded-2xl border border-border/70 bg-card">
        <div className="border-b border-border/70 px-7 py-5">
          <h2 className="text-[18px] font-extrabold tracking-[-0.01em]">
            국가별 배송비 (항공 · 0.5kg 기준)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-[14px]">
            <thead>
              <tr className="text-left text-[12.5px] text-muted-foreground">
                <th className="px-7 py-3 font-semibold">국가</th>
                <th className="px-7 py-3 font-semibold">평균 소요</th>
                <th className="px-7 py-3 font-semibold">기본 0.5kg</th>
                <th className="px-7 py-3 font-semibold">추가 0.5kg당</th>
              </tr>
            </thead>
            <tbody>
              {RATES.map((rate) => (
                <tr key={rate.country} className="border-t border-border/70">
                  <td className="px-7 py-4 font-bold">{rate.country}</td>
                  <td className="px-7 py-4 text-muted-foreground">
                    {rate.days}
                  </td>
                  <td className="px-7 py-4 font-semibold">{rate.first}</td>
                  <td className="px-7 py-4 font-semibold">{rate.extra}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-border/70 px-7 py-4 text-[12.5px] text-muted-foreground">
          실제 요금은 부피 무게와 통관 규정에 따라 달라질 수 있습니다.
        </p>
      </section>
    </main>
  );
}
