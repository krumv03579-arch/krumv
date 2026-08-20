import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { ArtistChip } from "@/components/artist-chip";
import { Panel, PanelHeader } from "@/components/panel";
import { compact, comma } from "@/lib/format";
import { feedFilters, posts, type ArtistKey } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Filter = "all" | ArtistKey;

export function TrendingPanel() {
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(() => {
    const pool =
      filter === "all" ? posts : posts.filter((post) => post.artist === filter);
    return [...pool].sort((a, b) => b.talking - a.talking).slice(0, 3);
  }, [filter]);

  return (
    <Panel className="p-5 sm:p-6">
      <PanelHeader
        eyebrow="Now Trending"
        eyebrowClassName="text-[#e0364f]"
        title="지금 뜨거운 이야기"
        moreTo="/feed"
      />

      <ol className="mt-5">
        {rows.map((post, i) => (
          <li key={post.id}>
            <Link
              to="/feed/$postId"
              params={{ postId: post.id }}
              className="group flex items-center gap-4 rounded-xl px-2 py-3.5 transition-colors hover:bg-secondary/60"
            >
              <span
                className={cn(
                  "w-6 shrink-0 text-center text-[15px] font-black tabular-nums",
                  i === 0 ? "text-[#e0364f]" : "text-muted-foreground/60",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="hidden sm:block">
                <ArtistChip artist={post.artist} interactive={false} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-bold text-foreground transition-colors group-hover:text-primary">
                  {post.title}
                </span>
                <span className="mt-1 block truncate text-[12.5px] text-muted-foreground">
                  {post.category} · {comma(post.talking)}명이 이야기 중
                </span>
              </span>
              <span className="hidden shrink-0 items-center gap-3 text-xs text-muted-foreground sm:flex">
                <span className="inline-flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" />
                  {compact(post.likes)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {compact(post.comments)}
                </span>
              </span>
            </Link>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="px-2 py-10 text-center text-sm text-muted-foreground">
            아직 이 아티스트의 이야기가 없어요. 첫 글을 남겨보세요!
          </li>
        )}
      </ol>

      <div className="relative mt-4">
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pt-1">
          {feedFilters.map((chip) => {
            const active = filter === chip.key;
            return (
              <button
                key={chip.key}
                type="button"
                onClick={() => setFilter(chip.key as Filter)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-[13px] font-bold transition-colors",
                  active
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
                )}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
        <span className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-card to-transparent" />
      </div>
    </Panel>
  );
}
