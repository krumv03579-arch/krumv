import { createFileRoute, Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { useMemo, useState } from "react";

import { TrendIcon } from "@/components/home/live-chart";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { comma } from "@/lib/format";
import { artistByKey, chart } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chart")({
  head: () => ({
    meta: [
      { title: "뮤직차트 — pulseroom" },
      {
        name: "description",
        content: "pulseroom 실시간 인기 음악 차트 TOP 10.",
      },
    ],
  }),
  component: ChartPage,
});

const RANGES = [
  { key: "live", label: "실시간" },
  { key: "daily", label: "일간" },
  { key: "weekly", label: "주간" },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

function ChartPage() {
  const [range, setRange] = useState<RangeKey>("live");

  const rows = useMemo(() => {
    const list = [...chart];
    if (range === "daily") list.sort((a, b) => b.listeners - a.listeners);
    if (range === "weekly")
      list.sort((a, b) => a.peak - b.peak || a.rank - b.rank);
    return list;
  }, [range]);

  const podium = rows.slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 pb-4 pt-8 sm:px-6">
      <PageHeader
        eyebrow="Music chart"
        title="실시간 뮤직차트"
        description="08월 20일 14:00 기준 · 팬룸 스트리밍과 커뮤니티 반응을 함께 반영합니다."
        action={
          <div className="flex gap-2">
            {RANGES.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setRange(item.key)}
                className={cn(
                  "rounded-full px-4 py-2 text-[13px] font-bold transition-colors",
                  range === item.key
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {podium.map((entry, index) => (
          <article
            key={`${entry.title}-podium`}
            className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--shadow-card)]"
          >
            <div className="relative">
              <img
                src={entry.cover}
                alt=""
                className="aspect-square w-full rounded-xl object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/55 text-[15px] font-black text-white backdrop-blur">
                {index + 1}
              </span>
            </div>
            <p className="mt-3.5 truncate text-[17px] font-extrabold tracking-[-0.01em]">
              {entry.title}
            </p>
            <Link
              to="/artists/$artistId"
              params={{ artistId: entry.artist }}
              className="mt-1 block truncate text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {artistByKey[entry.artist].name}
            </Link>
            <div className="mt-3 flex items-center justify-between text-[12px] text-muted-foreground">
              <span>청취자 {comma(entry.listeners)}</span>
              <TrendIcon trend={entry.trend} />
            </div>
          </article>
        ))}
      </div>

      <Panel className="mt-6 overflow-hidden">
        <div className="hidden grid-cols-[64px_minmax(0,1fr)_140px_120px_80px] items-center gap-4 border-b border-border/70 px-6 py-3.5 text-[11.5px] font-extrabold uppercase tracking-widest text-muted-foreground sm:grid">
          <span>순위</span>
          <span>곡 / 아티스트</span>
          <span>앨범</span>
          <span className="text-right">청취자</span>
          <span className="text-right">재생</span>
        </div>

        <ol>
          {rows.map((entry, index) => (
            <li
              key={`${entry.title}-row`}
              className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-4 border-b border-border/70 px-4 py-3.5 transition-colors last:border-b-0 hover:bg-secondary/50 sm:grid-cols-[64px_minmax(0,1fr)_140px_120px_80px] sm:px-6"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 text-center text-[15px] font-black tabular-nums">
                  {index + 1}
                </span>
                <span className="flex w-5 flex-col items-center">
                  <TrendIcon trend={entry.trend} />
                  {entry.change > 0 && entry.trend !== "new" && (
                    <span className="text-[10px] font-bold tabular-nums text-muted-foreground">
                      {entry.change}
                    </span>
                  )}
                </span>
              </div>

              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={entry.cover}
                  alt=""
                  loading="lazy"
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold">
                    {entry.title}
                  </p>
                  <Link
                    to="/artists/$artistId"
                    params={{ artistId: entry.artist }}
                    className="mt-0.5 block truncate text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {artistByKey[entry.artist].name}
                  </Link>
                </div>
              </div>

              <span className="hidden truncate text-[13px] text-muted-foreground sm:block">
                {entry.album}
              </span>
              <span className="hidden text-right text-[13px] tabular-nums text-muted-foreground sm:block">
                {comma(entry.listeners)}
              </span>

              <div className="flex items-center justify-end gap-2">
                <span className="hidden text-[12px] tabular-nums text-muted-foreground sm:inline">
                  {entry.duration}
                </span>
                <button
                  type="button"
                  aria-label={`${entry.title} 재생`}
                  className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      </Panel>
    </main>
  );
}
