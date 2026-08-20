import { createFileRoute } from "@tanstack/react-router";

import { HeroCarousel } from "@/components/hero-carousel";
import { CommunityFeed } from "@/components/home/community-feed";
import { LiveChartCard } from "@/components/home/live-chart";
import { LivePickCard } from "@/components/home/live-pick";
import { PulsePickCard } from "@/components/home/pulse-pick";
import { SchedulePanel } from "@/components/home/schedule-panel";
import { SearchPanel } from "@/components/home/search-panel";
import { TasteCard } from "@/components/home/taste-card";
import { TrendingPanel } from "@/components/home/trending-panel";
import { WeekRoomCard } from "@/components/home/week-room";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "pulseroom — 아이돌 팬 커뮤니티" },
      {
        name: "description",
        content:
          "좋아하는 아티스트의 오늘을 함께 기록하는 곳. 실시간 인기 이야기, 팬 커뮤니티, 뮤직차트를 한 화면에서 만나보세요.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <main className="mx-auto w-full max-w-[1460px] px-4 pb-4 pt-5 sm:px-6">
      <HeroCarousel />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_330px] xl:grid-cols-[290px_minmax(0,1fr)_330px]">
        {/* Promo rail — a dedicated left column only once there is room for three. */}
        <aside className="hidden flex-col gap-5 xl:flex">
          <PulsePickCard />
          <LivePickCard />
        </aside>

        <div className="flex flex-col gap-6">
          <SearchPanel />
          <TrendingPanel />
          <CommunityFeed />
        </div>

        <aside className="flex flex-col gap-5">
          <TasteCard />
          <LiveChartCard />
          <WeekRoomCard />
          <SchedulePanel />
          <div className="flex flex-col gap-5 xl:hidden">
            <PulsePickCard />
            <LivePickCard />
          </div>
        </aside>
      </div>
    </main>
  );
}
