import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bookmark,
  Eye,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ArtistChip } from "@/components/artist-chip";
import { AvatarBadge } from "@/components/avatar-badge";
import { Panel, PanelHeader } from "@/components/panel";
import { PostTextCard } from "@/components/post-card";
import { Textarea } from "@/components/ui/textarea";
import { comma } from "@/lib/format";
import {
  artistByKey,
  commentsByPost,
  defaultComments,
  postById,
  posts,
  type Comment,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/feed/$postId")({
  head: ({ params }) => {
    const post = postById[params.postId];
    return {
      meta: [
        { title: post ? `${post.title} — pulseroom` : "글 — pulseroom" },
        {
          name: "description",
          content: post?.excerpt ?? "pulseroom 커뮤니티 글",
        },
      ],
    };
  },
  component: PostPage,
});

function PostPage() {
  const { postId } = Route.useParams();
  const post = postById[postId];

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState("");
  const [comments, setComments] = useState<Comment[]>(
    () => commentsByPost[postId] ?? defaultComments,
  );

  const related = useMemo(
    () =>
      post
        ? posts
            .filter((p) => p.artist === post.artist && p.id !== post.id)
            .slice(0, 3)
        : [],
    [post],
  );

  if (!post) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-extrabold tracking-[-0.02em]">
          글을 찾을 수 없어요
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          삭제됐거나 아직 저장되지 않은 글일 수 있어요.
        </p>
        <Link
          to="/feed"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
        >
          피드로 돌아가기
        </Link>
      </main>
    );
  }

  const artist = artistByKey[post.artist];

  function addComment(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        author: "나",
        authorTag: "게스트",
        createdLabel: "방금 전",
        body: draft.trim(),
        likes: 0,
      },
    ]);
    setDraft("");
    toast.success("댓글을 남겼어요.");
  }

  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 pb-4 pt-6 sm:px-6">
      <Link
        to="/feed"
        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        피드로 돌아가기
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-5">
          <Panel className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <ArtistChip artist={post.artist} size="md" />
              <span className="text-[12.5px] font-bold text-muted-foreground">
                {post.category}
              </span>
              {post.hot && (
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide text-destructive">
                  hot
                </span>
              )}
            </div>

            <h1 className="mt-4 text-[28px] font-black leading-[1.25] tracking-[-0.025em] sm:text-[32px]">
              {post.title}
            </h1>

            <div className="mt-5 flex items-center gap-3 border-b border-border/70 pb-5">
              <AvatarBadge name={post.author} size="lg" />
              <div className="min-w-0">
                <p className="text-sm font-bold">{post.author}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {post.authorTag} · {post.createdLabel}
                </p>
              </div>
              <span className="ml-auto inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                <Eye className="h-4 w-4" />
                {comma(post.views)}
              </span>
            </div>

            {post.image && (
              <img
                src={post.image}
                alt=""
                className="mt-6 aspect-[16/9] w-full rounded-2xl object-cover"
              />
            )}

            <div className="mt-6 space-y-4 text-[15.5px] leading-[1.85] text-foreground/90">
              {post.body.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setLiked((prev) => !prev)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition-colors",
                  liked
                    ? "border-destructive/30 bg-destructive/10 text-destructive"
                    : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                좋아요 {comma(post.likes + (liked ? 1 : 0))}
              </button>
              <span className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-bold text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                댓글 {comma(comments.length)}
              </span>
              <button
                type="button"
                onClick={() => setSaved((prev) => !prev)}
                className={cn(
                  "ml-auto grid h-11 w-11 place-items-center rounded-full border transition-colors",
                  saved
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
                aria-label="저장"
              >
                <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
              </button>
              <button
                type="button"
                onClick={() => toast.success("링크를 복사했어요.")}
                className="grid h-11 w-11 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="공유"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </Panel>

          <Panel className="p-6 sm:p-8">
            <PanelHeader eyebrow="Comments" title={`댓글 ${comments.length}`} />

            <form onSubmit={addComment} className="mt-5">
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="따뜻한 댓글을 남겨주세요."
                className="min-h-[96px]"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  댓글 등록
                </button>
              </div>
            </form>

            <ul className="mt-6 divide-y divide-border/70">
              {comments.map((comment) => (
                <li key={comment.id} className="flex gap-3 py-4">
                  <AvatarBadge name={comment.author} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold">
                        {comment.author}
                      </span>
                      <span className="text-[11.5px] text-muted-foreground">
                        {comment.authorTag} · {comment.createdLabel}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-foreground/90">
                      {comment.body}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-[11.5px] text-muted-foreground">
                      <Heart className="h-3.5 w-3.5" />
                      {comma(comment.likes)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <aside className="flex flex-col gap-5">
          <Panel className="overflow-hidden">
            <img
              src={artist.cover}
              alt=""
              className="h-24 w-full object-cover"
            />
            <div className="-mt-8 px-5 pb-5">
              <img
                src={artist.image}
                alt=""
                className="h-16 w-16 rounded-2xl object-cover ring-4 ring-card"
              />
              <p className="mt-3 text-lg font-extrabold tracking-[-0.02em]">
                {artist.name}
              </p>
              <p className="text-[12.5px] text-muted-foreground">
                {artist.nameKo} · {artist.type}
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                {artist.tagline}
              </p>
              <Link
                to="/artists/$artistId"
                params={{ artistId: artist.key }}
                className="mt-4 flex items-center justify-center rounded-full bg-secondary py-2.5 text-[13px] font-bold transition-colors hover:bg-secondary/70"
              >
                아티스트 홈 가기
              </Link>
            </div>
          </Panel>

          {related.length > 0 && (
            <Panel className="p-5">
              <PanelHeader eyebrow="Related" title="같은 팬룸의 글" />
              <div className="mt-4 grid grid-cols-1 gap-3">
                {related.map((item) => (
                  <PostTextCard key={item.id} post={item} />
                ))}
              </div>
            </Panel>
          )}
        </aside>
      </div>
    </main>
  );
}
