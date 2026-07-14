import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Pencil, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CommunityBanner } from "@/components/community-banner";

export const Route = createFileRoute("/community/")({
  ssr: false,
  head: () => ({ meta: [{ title: "커뮤니티 — 딜렉스타" }] }),
  component: CommunityList,
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

const PAGE_SIZE = 12;

function fmtDate(s: string) {
  const d = new Date(s);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}일 전`;
  return d.toLocaleDateString("ko-KR");
}

function CommunityList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinel = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const doneRef = useRef(false);

  async function loadMore() {
    if (loadingRef.current || doneRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    let fromIdx = 0;
    setPosts((prev) => {
      fromIdx = prev.length;
      return prev;
    });
    const { data, error } = await supabase
      .from("posts" as never)
      .select("*")
      .order("created_at", { ascending: false })
      .range(fromIdx, fromIdx + PAGE_SIZE - 1);
    if (error) {
      setError(error.message);
    } else {
      const next = (data ?? []) as unknown as Post[];
      setPosts((p) => {
        const seen = new Set(p.map((x) => x.id));
        return [...p, ...next.filter((x) => !seen.has(x.id))];
      });
      const missing = Array.from(new Set(next.map((n) => n.user_id))).filter((id) => !names[id]);
      if (missing.length > 0) {
        const { data: profs } = await supabase
          .from("profiles" as never)
          .select("id, display_name")
          .in("id", missing);
        if (profs) {
          setNames((m) => {
            const nm = { ...m };
            for (const row of profs as unknown as { id: string; display_name: string }[]) {
              nm[row.id] = row.display_name;
            }
            return nm;
          });
        }
      }
      if (next.length < PAGE_SIZE) {
        doneRef.current = true;
        setDone(true);
      }
    }
    setLoading(false);
    loadingRef.current = false;
  }

  useEffect(() => {
    void loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const ob = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) void loadMore();
    });
    ob.observe(el);
    return () => ob.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, done, loading]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <div className="w-full">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">커뮤니티</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            자유게시판·질문·후기를 함께 나눠요.
          </p>
        </div>
        <Link to="/community/new">
          <Button className="h-11 gap-2 px-5 text-base font-bold">
            <Pencil className="h-4 w-4" /> 글쓰기
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <CommunityBanner />
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {posts.length === 0 && !loading ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          아직 게시글이 없어요. 첫 글을 작성해보세요!
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {posts.map((p) => (
            <li key={p.id}>
              <Link
                to="/community/$id"
                params={{ id: p.id }}
                className="group block overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-pitch"
              >
                <div className="relative aspect-[16/10] bg-secondary">
                  {p.image_urls[0] ? (
                    <img
                      src={p.image_urls[0]}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8 opacity-40" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-2 text-sm font-bold leading-snug">{p.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.content}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="max-w-[100px] truncate font-semibold text-foreground/80">
                        {names[p.user_id] ?? "익명"}
                      </span>
                      <span>·</span>
                      <span className="shrink-0">{fmtDate(p.created_at)}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" /> {p.likes_count}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5" /> {p.comments_count}
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div ref={sentinel} className="h-12" />
      {loading && (
        <p className="py-4 text-center text-sm text-muted-foreground">불러오는 중...</p>
      )}
      {done && posts.length > 0 && (
        <p className="py-4 text-center text-xs text-muted-foreground">마지막 게시글입니다.</p>
      )}
      </div>
    </main>
  );
}