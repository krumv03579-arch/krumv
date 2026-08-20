import { Link } from "@tanstack/react-router";
import { PenLine } from "lucide-react";

import { Panel, PanelHeader } from "@/components/panel";
import { PostCoverCard, PostTextCard } from "@/components/post-card";
import { posts } from "@/lib/mock-data";

const [lead, ...rest] = posts.filter((post) => !post.hot);

export function CommunityFeed() {
  return (
    <Panel className="p-5 sm:p-6">
      <PanelHeader
        eyebrow="Community Feed"
        title="새로 올라온 글"
        action={
          <Link
            to="/feed"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-[13px] font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <PenLine className="h-3.5 w-3.5" />
            글쓰기
          </Link>
        }
      />

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <PostCoverCard post={lead} />
        <div className="grid gap-4">
          {rest.slice(0, 2).map((post) => (
            <PostTextCard key={post.id} post={post} />
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 border-t border-border/70 pt-5 sm:grid-cols-2 lg:grid-cols-3">
        {rest.slice(2, 5).map((post) => (
          <PostTextCard key={post.id} post={post} />
        ))}
      </div>

      <Link
        to="/feed"
        className="mt-5 flex items-center justify-center rounded-xl border border-border/70 py-3 text-[13px] font-bold text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
      >
        커뮤니티 글 더 보기
      </Link>
    </Panel>
  );
}
