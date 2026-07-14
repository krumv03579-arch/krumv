import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, MessageCircle, Trash2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { logActivity } from "@/lib/activity-log";

export const Route = createFileRoute("/community/$id")({
  ssr: false,
  head: () => ({ meta: [{ title: "게시글 — 딜렉스타 커뮤니티" }] }),
  component: PostDetail,
});

type Post = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_urls: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
};

type Comment = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
};

function fmtDate(s: string) {
  return new Date(s).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" });
}

function shortUid(id: string) {
  return id.slice(0, 8);
}

function PostDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [liked, setLiked] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);

  async function load() {
    setLoading(true);
    const [postRes, commentsRes] = await Promise.all([
      supabase.from("posts" as never).select("*").eq("id", id).maybeSingle(),
      supabase
        .from("comments")
        .select("id, user_id, content, created_at, parent_id")
        .eq("post_id", id)
        .order("created_at", { ascending: false }),
    ]);
    if (postRes.error) setError(postRes.error.message);
    setPost((postRes.data ?? null) as unknown as Post | null);
    setComments((commentsRes.data ?? []) as unknown as Comment[]);
    if (user) {
      const { data } = await supabase
        .from("likes" as never)
        .select("post_id")
        .eq("post_id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      setLiked(!!data);
    } else {
      setLiked(false);
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  async function toggleLike() {
    if (!user) {
      navigate({
        to: "/auth",
        search: { redirect: window.location.pathname + window.location.search },
      });
      return;
    }
    if (!post || likeBusy) return;
    setLikeBusy(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setPost({ ...post, likes_count: post.likes_count + (wasLiked ? -1 : 1) });
    if (wasLiked) {
      const { error } = await supabase
        .from("likes" as never)
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", user.id);
      if (error) {
        setLiked(true);
        setPost({ ...post, likes_count: post.likes_count });
      }
    } else {
      const { error } = await supabase
        .from("likes" as never)
        .insert({ post_id: post.id, user_id: user.id } as never);
      if (error) {
        setLiked(false);
        setPost({ ...post, likes_count: post.likes_count });
      }
    }
    setLikeBusy(false);
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !commentText.trim() || !post) return;
    setPosting(true);
    const { data, error } = await supabase
      .from("comments")
      .insert({ user_id: user.id, post_id: post.id, content: commentText.trim() })
      .select("id, user_id, content, created_at, parent_id")
      .single();
    if (!error && data) {
      setComments((c) => [data as Comment, ...c]);
      setPost({ ...post, comments_count: post.comments_count + 1 });
      setCommentText("");
      await logActivity({ action: "comment_create", targetType: "comment", targetId: (data as Comment).id, metadata: { post_id: post.id } });
    }
    setPosting(false);
  }

  async function deleteComment(cid: string) {
    if (!confirm("댓글을 삭제할까요?")) return;
    const { error } = await supabase.from("comments").delete().eq("id", cid);
    if (!error) {
      setComments((c) => c.filter((x) => x.id !== cid));
      if (post) setPost({ ...post, comments_count: Math.max(post.comments_count - 1, 0) });
      await logActivity({ action: "comment_delete", targetType: "comment", targetId: cid });
    }
  }

  async function deletePost() {
    if (!post || !confirm("게시글을 삭제할까요?")) return;
    const { error } = await supabase.from("posts" as never).delete().eq("id", post.id);
    if (!error) {
      await logActivity({ action: "post_delete", targetType: "post", targetId: post.id, metadata: { title: post.title } });
      navigate({ to: "/community" });
    } else setError(error.message);
  }

  if (loading) {
    return <main className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted-foreground">불러오는 중...</main>;
  }
  if (!post) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-muted-foreground">게시글을 찾을 수 없습니다.</p>
        <Link to="/community" className="mt-3 inline-block text-sm text-pitch hover:underline">← 커뮤니티</Link>
      </main>
    );
  }

  const isOwner = user?.id === post.user_id;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Link to="/community" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> 커뮤니티
      </Link>

      <article className="rounded-lg border border-border bg-card p-5 sm:p-6">
        <header className="border-b border-border pb-4">
          <h1 className="text-xl font-black tracking-tight sm:text-2xl">{post.title}</h1>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>작성자 #{shortUid(post.user_id)} · {fmtDate(post.created_at)}</span>
            {isOwner && (
              <button onClick={deletePost} className="inline-flex items-center gap-1 text-destructive hover:underline">
                <Trash2 className="h-3.5 w-3.5" /> 삭제
              </button>
            )}
          </div>
        </header>

        <div className="prose prose-sm mt-4 max-w-none whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {post.content}
        </div>

        {post.image_urls.length > 0 && (
          <div className="mt-4 space-y-3">
            {post.image_urls.map((u) => (
              <img key={u} src={u} alt="" className="w-full rounded-lg border border-border" loading="lazy" />
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center gap-2">
          <button
            onClick={toggleLike}
            disabled={likeBusy}
            className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-colors ${
              liked ? "border-red-500 bg-red-500/10 text-red-600" : "border-border bg-background hover:bg-secondary"
            }`}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            {post.likes_count}
          </button>
          <span className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            {post.comments_count}
          </span>
        </div>
      </article>

      <section className="mt-8">
        <h2 className="mb-3 text-base font-bold">댓글 {post.comments_count}</h2>

        {user ? (
          <form onSubmit={submitComment} className="mb-4 space-y-2">
            <Textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="따뜻한 댓글을 남겨주세요."
              maxLength={1000}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={posting || !commentText.trim()}>
                {posting ? "등록 중..." : "댓글 등록"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="mb-4 rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            댓글을 작성하려면{" "}
            <Link to="/auth" className="font-semibold text-pitch hover:underline">로그인</Link>이 필요합니다.
          </div>
        )}

        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="rounded-md border border-border bg-card p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>#{shortUid(c.user_id)} · {fmtDate(c.created_at)}</span>
                {user?.id === c.user_id && (
                  <button onClick={() => deleteComment(c.id)} className="inline-flex items-center gap-1 hover:text-destructive">
                    <Trash2 className="h-3 w-3" /> 삭제
                  </button>
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{c.content}</p>
            </li>
          ))}
          {comments.length === 0 && (
            <li className="rounded-md border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              첫 댓글을 남겨보세요.
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}