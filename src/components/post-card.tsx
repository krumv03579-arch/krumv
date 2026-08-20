import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle } from "lucide-react";

import { ArtistChip } from "@/components/artist-chip";
import { compact } from "@/lib/format";
import type { Post } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function PostStats({
  post,
  className,
}: {
  post: Post;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-3 text-xs text-muted-foreground",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1">
        <Heart className="h-3.5 w-3.5" />
        {compact(post.likes)}
      </span>
      <span className="inline-flex items-center gap-1">
        <MessageCircle className="h-3.5 w-3.5" />
        {compact(post.comments)}
      </span>
    </span>
  );
}

/** Feed card with a cover image — the lead item of a feed grid. */
export function PostCoverCard({
  post,
  className,
}: {
  post: Post;
  className?: string;
}) {
  return (
    <article className={cn("group flex h-full flex-col", className)}>
      <Link
        to="/feed/$postId"
        params={{ postId: post.id }}
        className="relative block overflow-hidden rounded-2xl bg-secondary"
      >
        <img
          src={post.image ?? "/img/feed-crowd.svg"}
          alt=""
          loading="lazy"
          className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
          {post.category}
        </span>
      </Link>
      <div className="mt-4 flex flex-1 flex-col">
        <ArtistChip artist={post.artist} className="self-start" />
        <Link
          to="/feed/$postId"
          params={{ postId: post.id }}
          className="mt-2.5 block"
        >
          <h3 className="text-[17px] font-extrabold leading-snug tracking-[-0.01em] text-foreground transition-colors group-hover:text-primary">
            {post.title}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2-safe text-[13px] leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground/70">
            by. {post.author}
          </span>
          <span aria-hidden>·</span>
          <span>{post.createdLabel}</span>
          <PostStats post={post} className="ml-auto" />
        </div>
      </div>
    </article>
  );
}

/** Compact text card used beside the lead item and in list layouts. */
export function PostTextCard({
  post,
  className,
}: {
  post: Post;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-2xl border border-border/70 bg-secondary/40 p-4 transition-colors hover:border-primary/30 hover:bg-secondary/70",
        className,
      )}
    >
      <ArtistChip artist={post.artist} className="self-start" />
      <Link to="/feed/$postId" params={{ postId: post.id }} className="mt-2.5">
        <h3 className="line-clamp-2-safe text-[15px] font-extrabold leading-snug text-foreground transition-colors group-hover:text-primary">
          {post.title}
        </h3>
      </Link>
      <p className="mt-2 line-clamp-2-safe text-[12.5px] leading-relaxed text-muted-foreground">
        {post.excerpt}
      </p>
      <div className="mt-auto flex items-center gap-2 pt-4 text-[11.5px] text-muted-foreground">
        <span className="font-semibold text-foreground/70">
          by. {post.author}
        </span>
        <span aria-hidden>·</span>
        <span>{post.createdLabel}</span>
        <PostStats post={post} className="ml-auto text-[11.5px]" />
      </div>
    </article>
  );
}

/** Wide row used on the feed page listing. */
export function PostRow({ post }: { post: Post }) {
  return (
    <article className="group flex gap-4 border-b border-border/70 py-5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <ArtistChip artist={post.artist} />
          <span className="text-[11.5px] font-semibold text-muted-foreground">
            {post.category}
          </span>
          {post.hot && (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide text-destructive">
              hot
            </span>
          )}
        </div>
        <Link
          to="/feed/$postId"
          params={{ postId: post.id }}
          className="mt-2.5 block"
        >
          <h3 className="text-[17px] font-extrabold leading-snug tracking-[-0.01em] text-foreground transition-colors group-hover:text-primary">
            {post.title}
          </h3>
        </Link>
        <p className="mt-1.5 line-clamp-2-safe text-[13px] leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground/70">
            by. {post.author}
          </span>
          <span aria-hidden>·</span>
          <span>{post.createdLabel}</span>
          <span aria-hidden>·</span>
          <span>조회 {compact(post.views)}</span>
          <PostStats post={post} className="ml-auto" />
        </div>
      </div>
      {post.image && (
        <Link
          to="/feed/$postId"
          params={{ postId: post.id }}
          className="hidden h-[104px] w-[150px] shrink-0 overflow-hidden rounded-xl bg-secondary sm:block"
        >
          <img
            src={post.image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        </Link>
      )}
    </article>
  );
}
