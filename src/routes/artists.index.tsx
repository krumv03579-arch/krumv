import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { Panel, PanelHeader } from "@/components/panel";
import { compact } from "@/lib/format";
import { artists, chart } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/artists/")({
  head: () => ({
    meta: [
      { title: "아티스트 — deluxla" },
      {
        name: "description",
        content: "딜렉스타에서 활동 중인 아티스트와 팬룸을 만나보세요.",
      },
    ],
  }),
  component: ArtistsPage,
});

const TYPE_FILTERS = ["전체", "그룹", "솔로"] as const;

function ArtistsPage() {
  const [filter, setFilter] = useState<(typeof TYPE_FILTERS)[number]>("전체");

  const visible = useMemo(() => {
    if (filter === "전체") return artists;
    const solo = filter === "솔로";
    return artists.filter((artist) => (artist.members.length === 1) === solo);
  }, [filter]);

  const rising = useMemo(
    () => [...artists].sort((a, b) => b.todayPosts - a.todayPosts).slice(0, 5),
    [],
  );

  return (
    <main className="mx-auto w-full max-w-[1460px] px-4 pb-4 pt-8 sm:px-6">
      <PageHeader
        eyebrow="Artists"
        title="아티스트"
        description="팬룸이 열려 있는 아티스트 목록이에요. 팔로우하면 새 소식이 피드 상단에 올라옵니다."
        action={
          <div className="flex gap-2">
            {TYPE_FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={cn(
                  "rounded-full px-4 py-2 text-[13px] font-bold transition-colors",
                  filter === item
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground hover:text-foreground",
                )}
              >
                {item}
              </button>
            ))}
          </div>
        }
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((artist) => (
            <Link
              key={artist.key}
              to="/artists/$artistId"
              params={{ artistId: artist.key }}
              className="group overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1"
            >
              <div className="relative">
                <img
                  src={artist.image}
                  alt={artist.name}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a1f]/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                  <p className="text-lg font-black tracking-[-0.02em]">
                    {artist.name}
                  </p>
                  <p className="text-[12px] text-white/75">
                    {artist.nameKo} · {artist.type}
                  </p>
                </div>
              </div>
              <div className="p-4">
                <p className="line-clamp-2-safe text-[13px] leading-relaxed text-muted-foreground">
                  {artist.tagline}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {artist.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3 text-[12px] text-muted-foreground">
                  <span>
                    팔로워{" "}
                    <b className="font-bold text-foreground">
                      {compact(artist.followers)}
                    </b>
                  </span>
                  <span>
                    오늘 글{" "}
                    <b className="font-bold text-foreground">
                      {artist.todayPosts}
                    </b>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <aside className="flex flex-col gap-5">
          <Panel className="p-5">
            <PanelHeader eyebrow="Rising now" title="오늘 가장 활발한" />
            <ol className="mt-4 space-y-1">
              {rising.map((artist, index) => (
                <li key={artist.key}>
                  <Link
                    to="/artists/$artistId"
                    params={{ artistId: artist.key }}
                    className="group flex items-center gap-3 rounded-xl px-1.5 py-2 transition-colors hover:bg-secondary/60"
                  >
                    <span className="w-4 text-center text-[13px] font-black tabular-nums text-primary">
                      {index + 1}
                    </span>
                    <img
                      src={artist.image}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-bold transition-colors group-hover:text-primary">
                        {artist.name}
                      </span>
                      <span className="block truncate text-[11.5px] text-muted-foreground">
                        팬덤 {artist.fandom}
                      </span>
                    </span>
                    <span className="text-[12px] font-bold text-muted-foreground">
                      +{artist.todayPosts}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel className="p-5">
            <PanelHeader eyebrow="New release" title="새로 나온 앨범" />
            <div className="mt-4 grid grid-cols-3 gap-3">
              {chart.slice(0, 6).map((entry) => (
                <Link
                  key={`${entry.rank}-${entry.album}`}
                  to="/chart"
                  className="group"
                  aria-label={`${entry.album} 차트에서 보기`}
                >
                  <img
                    src={entry.cover}
                    alt=""
                    loading="lazy"
                    className="aspect-square w-full rounded-xl object-cover transition-transform group-hover:-translate-y-0.5"
                  />
                  <p className="mt-1.5 truncate text-[11.5px] font-bold">
                    {entry.album}
                  </p>
                </Link>
              ))}
            </div>
          </Panel>
        </aside>
      </div>
    </main>
  );
}
