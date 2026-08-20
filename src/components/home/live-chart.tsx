import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, ChevronUp, Minus } from "lucide-react";

import { Panel, PanelHeader } from "@/components/panel";
import { artistByKey, chart, type ChartTrend } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function TrendIcon({
  trend,
  className,
}: {
  trend: ChartTrend;
  className?: string;
}) {
  if (trend === "up")
    return <ChevronUp className={cn("h-4 w-4 text-[#e0364f]", className)} />;
  if (trend === "down")
    return <ChevronDown className={cn("h-4 w-4 text-[#2f6bff]", className)} />;
  if (trend === "new")
    return (
      <span
        className={cn(
          "text-[10px] font-extrabold tracking-wide text-[#e0364f]",
          className,
        )}
      >
        NEW
      </span>
    );
  return (
    <Minus className={cn("h-4 w-4 text-muted-foreground/50", className)} />
  );
}

export function LiveChartCard({ limit = 5 }: { limit?: number }) {
  return (
    <Panel className="p-5">
      <PanelHeader eyebrow="Live Chart" title="실시간 인기 음악" />

      <ol className="mt-4 space-y-1">
        {chart.slice(0, limit).map((entry) => (
          <li key={entry.rank}>
            <Link
              to="/chart"
              className="group flex items-center gap-3 rounded-xl px-1.5 py-2 transition-colors hover:bg-secondary/60"
            >
              <span className="w-4 shrink-0 text-center text-[13px] font-black tabular-nums text-foreground/70">
                {entry.rank}
              </span>
              <img
                src={entry.cover}
                alt=""
                loading="lazy"
                className="h-10 w-10 shrink-0 rounded-lg object-cover"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-bold text-foreground transition-colors group-hover:text-primary">
                  {entry.title}
                </span>
                <span className="block truncate text-[11.5px] text-muted-foreground">
                  {artistByKey[entry.artist].name}
                </span>
              </span>
              <TrendIcon trend={entry.trend} />
            </Link>
          </li>
        ))}
      </ol>

      <Link
        to="/chart"
        className="mt-3 flex items-center justify-center gap-1.5 border-t border-border/70 pt-4 text-[13px] font-bold text-muted-foreground transition-colors hover:text-foreground"
      >
        차트 전체 보기
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </Panel>
  );
}
