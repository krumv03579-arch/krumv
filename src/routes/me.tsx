import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bookmark,
  ChevronRight,
  Heart,
  LogOut,
  MessageCircle,
  PenLine,
  Settings,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import { useActivity } from "@/components/activity-provider";
import { ArtistChip } from "@/components/artist-chip";
import { useAuth } from "@/components/auth-provider";
import { AvatarBadge } from "@/components/avatar-badge";
import { Panel, PanelHeader } from "@/components/panel";
import { PostRow } from "@/components/post-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { resolvePost, type StoredReaction } from "@/lib/activity";
import { comma, relativeTime } from "@/lib/format";
import type { Post } from "@/lib/mock-data";

export const Route = createFileRoute("/me")({
  head: () => ({
    meta: [
      { title: "마이페이지 — pulseroom" },
      {
        name: "description",
        content:
          "내가 쓴 글, 남긴 댓글, 좋아요한 이야기를 한 곳에서 확인하세요.",
      },
    ],
  }),
  component: MyPage,
});

function MyPage() {
  const { user, ready: authReady, signOut } = useAuth();
  const { posts, activity, ready: activityReady } = useActivity();
  const navigate = useNavigate();

  const joinedAt = useMemo(
    () => (user ? user.createdAt.slice(0, 10).replace(/-/g, ".") : null),
    [user],
  );

  const resolveReactions = useCallback(
    (list: StoredReaction[]) =>
      list
        .map((item) => ({
          post: resolvePost(item.postId, posts),
          at: item.createdAt,
        }))
        .filter((item): item is { post: Post; at: number } =>
          Boolean(item.post),
        ),
    [posts],
  );

  const likedPosts = useMemo(
    () => resolveReactions(activity.likes),
    [activity.likes, resolveReactions],
  );
  const savedPosts = useMemo(
    () => resolveReactions(activity.saves),
    [activity.saves, resolveReactions],
  );

  if (!authReady || !activityReady) {
    return (
      <main className="mx-auto w-full max-w-[900px] px-4 py-16 sm:px-6">
        <div className="h-40 animate-pulse rounded-2xl bg-secondary" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-[560px] px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-black tracking-[-0.03em]">
          로그인이 필요한 페이지예요
        </h1>
        <p className="mt-2.5 text-sm text-muted-foreground">
          로그인하면 내가 쓴 글과 댓글, 좋아요한 이야기를 모아볼 수 있어요.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link
            to="/login"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            로그인
          </Link>
          <Link
            to="/signup"
            className="rounded-full border border-border px-5 py-2.5 text-sm font-bold transition-colors hover:bg-secondary"
          >
            회원가입
          </Link>
        </div>
      </main>
    );
  }

  const stats = [
    { label: "작성한 글", value: activity.posts.length, icon: PenLine },
    { label: "댓글", value: activity.comments.length, icon: MessageCircle },
    { label: "좋아요", value: likedPosts.length, icon: Heart },
    { label: "저장", value: savedPosts.length, icon: Bookmark },
  ];

  async function handleSignOut() {
    await signOut();
    toast.success("로그아웃했어요.");
    void navigate({ to: "/" });
  }

  return (
    <main className="mx-auto w-full max-w-[900px] px-4 pb-4 pt-6 sm:px-6">
      <Panel className="overflow-hidden">
        {/* The banner only ever sits behind the avatar — the name and email
            start below it, so nothing reads as clipped on a narrow screen. */}
        <div className="relative h-24 bg-gradient-to-r from-[#4f7cff] via-[#7b6cff] to-[#ff6f91] sm:h-28">
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
        </div>
        {/* Positioned so the avatar paints over the banner, not under it. */}
        <div className="relative px-5 pb-6 sm:px-8">
          <div className="-mt-11 flex items-end justify-between gap-4">
            <AvatarBadge
              name={user.nickname}
              size="lg"
              className="h-[88px] w-[88px] text-[30px] shadow-[var(--shadow-card)] ring-4 ring-card"
            />
            <Link
              to="/account"
              className="mb-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-[12.5px] font-bold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Settings className="h-3.5 w-3.5" />
              계정 설정
            </Link>
          </div>

          <div className="mt-4 min-w-0">
            <h1 className="break-keep text-[24px] font-black leading-tight tracking-[-0.03em] sm:text-[26px]">
              {user.nickname}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
              <span className="break-all">{user.email}</span>
              {joinedAt && (
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11.5px] font-semibold">
                  {joinedAt} 가입
                </span>
              )}
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-secondary/60 px-4 py-3"
              >
                <dt className="flex items-center gap-1.5 text-[11.5px] font-semibold text-muted-foreground">
                  <stat.icon className="h-3.5 w-3.5" />
                  {stat.label}
                </dt>
                <dd className="mt-1 text-[20px] font-black tabular-nums tracking-[-0.02em]">
                  {comma(stat.value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Panel>

      <Tabs defaultValue="posts" className="mt-6">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="posts">작성한 글</TabsTrigger>
          <TabsTrigger value="comments">댓글</TabsTrigger>
          <TabsTrigger value="likes">좋아요</TabsTrigger>
          <TabsTrigger value="saves">저장</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-5">
          <Panel className="px-5 py-1 sm:px-6">
            {activity.posts.length > 0 ? (
              activity.posts.map((post) => (
                <PostRow key={post.id} post={post} />
              ))
            ) : (
              <EmptyState
                message="아직 작성한 글이 없어요."
                actionLabel="첫 이야기 쓰러 가기"
                to="/feed"
              />
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="comments" className="mt-5">
          <Panel className="px-5 py-1 sm:px-6">
            {activity.comments.length > 0 ? (
              <ul className="divide-y divide-border/70">
                {activity.comments.map((comment) => {
                  const post = resolvePost(comment.postId, posts);
                  return (
                    <li key={comment.id} className="py-5">
                      <p className="text-[14.5px] leading-relaxed text-foreground/90">
                        {comment.body}
                      </p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
                        <span>{relativeTime(comment.createdAt)}</span>
                        {post && (
                          <>
                            <span aria-hidden>·</span>
                            <Link
                              to="/feed/$postId"
                              params={{ postId: post.id }}
                              className="inline-flex items-center gap-1 font-semibold text-foreground/70 transition-colors hover:text-primary"
                            >
                              {post.title}
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                message="아직 남긴 댓글이 없어요."
                actionLabel="이야기 둘러보기"
                to="/feed"
              />
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="likes" className="mt-5">
          <Panel className="px-5 py-1 sm:px-6">
            {likedPosts.length > 0 ? (
              <ul className="divide-y divide-border/70">
                {likedPosts.map(({ post, at }) => (
                  <PostMiniRow key={`like-${post.id}`} post={post} at={at} />
                ))}
              </ul>
            ) : (
              <EmptyState
                message="아직 좋아요한 글이 없어요."
                actionLabel="인기 이야기 보기"
                to="/feed"
              />
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="saves" className="mt-5">
          <Panel className="px-5 py-1 sm:px-6">
            {savedPosts.length > 0 ? (
              <ul className="divide-y divide-border/70">
                {savedPosts.map(({ post, at }) => (
                  <PostMiniRow key={`save-${post.id}`} post={post} at={at} />
                ))}
              </ul>
            ) : (
              <EmptyState
                message="저장한 글이 없어요."
                actionLabel="피드에서 저장해보기"
                to="/feed"
              />
            )}
          </Panel>
        </TabsContent>
      </Tabs>

      <Panel className="mt-6 p-5 sm:p-6">
        <PanelHeader eyebrow="Account" title="계정" />

        <dl className="mt-4 divide-y divide-border/70 border-y border-border/70">
          <div className="flex items-center justify-between gap-4 py-3.5">
            <dt className="text-[13.5px] font-semibold text-muted-foreground">
              이메일
            </dt>
            <dd className="break-all text-right text-[13.5px] font-bold">
              {user.email}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3.5">
            <dt className="text-[13.5px] font-semibold text-muted-foreground">
              닉네임
            </dt>
            <dd className="truncate text-[13.5px] font-bold">
              {user.nickname}
            </dd>
          </div>
        </dl>

        <Link
          to="/account"
          className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-secondary/40 px-4 py-3.5 transition-colors hover:bg-secondary/70"
        >
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 text-[13.5px] font-bold">
              <Settings className="h-3.5 w-3.5" />
              계정 설정
            </span>
            <span className="mt-0.5 block text-[12px] text-muted-foreground">
              닉네임 변경 · 비밀번호 변경 · 회원 탈퇴
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>

        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-bold text-destructive transition-colors hover:border-destructive/30 hover:bg-destructive/5"
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </button>
      </Panel>
    </main>
  );
}

function PostMiniRow({ post, at }: { post: Post; at: number }) {
  return (
    <li className="group py-4">
      <div className="flex items-center gap-2">
        <ArtistChip artist={post.artist} interactive={false} />
        <span className="text-[11.5px] font-semibold text-muted-foreground">
          {post.category}
        </span>
        <span className="ml-auto text-[11.5px] text-muted-foreground">
          {relativeTime(at)}
        </span>
      </div>
      <Link
        to="/feed/$postId"
        params={{ postId: post.id }}
        className="mt-2 block"
      >
        <p className="truncate text-[15px] font-bold transition-colors group-hover:text-primary">
          {post.title}
        </p>
        <p className="mt-1 truncate text-[12.5px] text-muted-foreground">
          by. {post.author} · {post.createdLabel}
        </p>
      </Link>
    </li>
  );
}

function EmptyState({
  message,
  actionLabel,
  to,
}: {
  message: string;
  actionLabel: string;
  to: string;
}) {
  return (
    <div className="py-16 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Link
        to={to}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2.5 text-[13px] font-bold transition-colors hover:bg-secondary/70"
      >
        {actionLabel}
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
