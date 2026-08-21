import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

import { useActivity } from "@/components/activity-provider";
import { ComposeDialog } from "@/components/compose-dialog";
import { LiveChartCard } from "@/components/home/live-chart";
import { SchedulePanel } from "@/components/home/schedule-panel";
import { PageHeader } from "@/components/page-header";
import { Panel, PanelHeader } from "@/components/panel";
import { PostRow } from "@/components/post-card";
import { compact } from "@/lib/format";
import {
  artists,
  feedFilters,
  postCategories,
  posts as seedPosts,
  type ArtistKey,
  type PostCategory,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/feed/")({
  head: () => ({
    meta: [
      { title: "피드 — pulseroom" },
      {
        name: "description",
        content: "팬들이 남긴 오늘의 이야기를 아티스트별로 모아봤어요.",
      },
    ],
  }),
  component: FeedPage,
});

type SortKey = "latest" | "popular" | "talking";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "latest", label: "최신순" },
  { key: "popular", label: "인기순" },
  { key: "talking", label: "화제순" },
];

function FeedPage() {
  const { posts, ready, error } = useActivity();
  const [artist, setArtist] = useState<"all" | ArtistKey>("all");
  const [category, setCategory] = useState<"all" | PostCategory>("all");
  const [sort, setSort] = useState<SortKey>("latest");

  const visible = useMemo(() => {
    const filtered = posts.filter(
      (post) =>
        (artist === "all" || post.artist === artist) &&
        (category === "all" || post.category === category),
    );
    const sorted = [...filtered];
    if (sort === "latest")
      sorted.sort((a, b) => a.createdMinutes - b.createdMinutes);
    if (sort === "popular") sorted.sort((a, b) => b.likes - a.likes);
    if (sort === "talking") sorted.sort((a, b) => b.talking - a.talking);
    return sorted;
  }, [posts, artist, category, sort]);

  const weeklyBest = useMemo(
    () => [...seedPosts].sort((a, b) => b.likes - a.likes).slice(0, 4),
    [],
  );

  return (
    <main className="mx-auto w-full max-w-[1460px] px-4 pb-4 pt-8 sm:px-6">
      <PageHeader
        eyebrow="Community"
        title="팬 커뮤니티 피드"
        description="응원하는 아티스트의 오늘을 기록하고, 다른 팬들의 이야기를 읽어보세요."
        action={<ComposeDialog />}
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="flex flex-col gap-5">
          <Panel className="p-4 sm:p-5">
            <div className="relative">
              <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
                {feedFilters.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => setArtist(chip.key as "all" | ArtistKey)}
                    className={cn(
                      "shrink-0 rounded-full px-4 py-2 text-[13px] font-bold transition-colors",
                      artist === chip.key
                        ? "bg-foreground text-background"
                        : "bg-secondary text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
              <span className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-card to-transparent" />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/70 pt-4">
              {(["all", ...postCategories] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item as "all" | PostCategory)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[12.5px] font-bold transition-colors",
                    category === item
                      ? "bg-primary/10 text-primary ring-1 ring-inset ring-primary/25"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {item === "all" ? "전체 말머리" : item}
                </button>
              ))}

              <div className="ml-auto flex items-center gap-1">
                {SORTS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSort(item.key)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-[12.5px] font-bold transition-colors",
                      sort === item.key
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </Panel>

          {error && (
            <p className="rounded-2xl bg-destructive/10 px-5 py-3.5 text-[13px] font-semibold text-destructive">
              {error}
            </p>
          )}

          <Panel className="px-5 py-1 sm:px-6">
            {visible.map((post) => (
              <PostRow key={post.id} post={post} />
            ))}
            {visible.length === 0 && (
              <p className="py-16 text-center text-sm text-muted-foreground">
                {ready
                  ? "조건에 맞는 글이 아직 없어요. 첫 이야기를 남겨보세요!"
                  : "이야기를 불러오는 중이에요…"}
              </p>
            )}
          </Panel>
        </div>

        <aside className="flex flex-col gap-5">
          <Panel className="p-5">
            <PanelHeader eyebrow="Weekly best" title="이번 주 인기 글" />
            <ol className="mt-4 space-y-1">
              {weeklyBest.map((post, index) => (
                <li key={post.id}>
                  <Link
                    to="/feed/$postId"
                    params={{ postId: post.id }}
                    className="group flex items-start gap-3 rounded-xl px-1.5 py-2.5 transition-colors hover:bg-secondary/60"
                  >
                    <span className="mt-0.5 w-4 shrink-0 text-center text-[13px] font-black tabular-nums text-primary">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2-safe text-[13.5px] font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                        {post.title}
                      </span>
                      <span className="mt-1 block text-[11.5px] text-muted-foreground">
                        좋아요 {compact(post.likes)} · 댓글{" "}
                        {compact(post.comments)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel className="p-5">
            <PanelHeader eyebrow="Hot rooms" title="지금 활발한 팬룸" />
            <ul className="mt-4 space-y-1">
              {artists.slice(0, 5).map((item) => (
                <li key={item.key}>
                  <Link
                    to="/artists/$artistId"
                    params={{ artistId: item.key }}
                    className="group flex items-center gap-3 rounded-xl px-1.5 py-2 transition-colors hover:bg-secondary/60"
                  >
                    <img
                      src={item.image}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-bold transition-colors group-hover:text-primary">
                        {item.name}
                      </span>
                      <span className="block truncate text-[11.5px] text-muted-foreground">
                        오늘 {item.todayPosts}개의 이야기
                      </span>
                    </span>
                    {item.todayPosts > 400 ? (
                      <Flame className="h-4 w-4 text-[#e0364f]" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-muted-foreground/50" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          <LiveChartCard limit={5} />
          <SchedulePanel />
        </aside>
      </div>
    </main>
  );
}
