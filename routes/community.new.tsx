import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ImagePlus, X, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { logActivity } from "@/lib/activity-log";

export const Route = createFileRoute("/community/new")({
  ssr: false,
  head: () => ({ meta: [{ title: "글쓰기 — 딜렉스타 커뮤니티" }] }),
  component: NewPostPage,
});

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 8;

interface ImageItem {
  file: File;
  preview: string;
}

function NewPostPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({
        to: "/auth",
        search: { redirect: window.location.pathname + window.location.search },
      });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => () => images.forEach((i) => URL.revokeObjectURL(i.preview)), [images]);

  function addFiles(files: FileList | null) {
    if (!files) return;
    setError(null);
    const fresh: ImageItem[] = [];
    for (const file of Array.from(files)) {
      if (!ALLOWED.includes(file.type)) {
        setError("jpg, png, webp 형식만 업로드 가능합니다.");
        continue;
      }
      if (file.size > MAX_SIZE) {
        setError("이미지는 장당 5MB 이하만 가능합니다.");
        continue;
      }
      fresh.push({ file, preview: URL.createObjectURL(file) });
    }
    setImages((prev) => [...prev, ...fresh].slice(0, MAX_FILES));
  }

  function removeImage(idx: number) {
    setImages((prev) => {
      const next = [...prev];
      const [r] = next.splice(idx, 1);
      if (r) URL.revokeObjectURL(r.preview);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const urls: string[] = [];
      for (const img of images) {
        const ext = (img.file.name.split(".").pop() ?? "jpg").toLowerCase();
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("post-images")
          .upload(path, img.file, { contentType: img.file.type, upsert: false });
        if (upErr) throw upErr;
        const { data: signed, error: sErr } = await supabase.storage
          .from("post-images")
          .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
        if (sErr || !signed) throw sErr ?? new Error("URL 생성 실패");
        urls.push(signed.signedUrl);
      }

      const { data, error: insErr } = await supabase
        .from("posts" as never)
        .insert({
          user_id: user.id,
          title: title.trim(),
          content: content.trim(),
          image_urls: urls,
        } as never)
        .select("id")
        .single();
      if (insErr) throw insErr;
      const id = (data as unknown as { id: string }).id;
      await logActivity({ action: "post_create", targetType: "post", targetId: id, metadata: { title: title.trim() } });
      navigate({ to: "/community/$id", params: { id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "게시 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return <main className="mx-auto max-w-2xl px-4 py-10 text-sm text-muted-foreground">불러오는 중...</main>;
  }
  if (!user) return null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">글쓰기</h1>
          <p className="mt-1 text-sm text-muted-foreground">커뮤니티 가이드를 지켜주세요.</p>
        </div>
        <Link to="/community" className="text-sm text-muted-foreground hover:text-foreground">취소</Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <section>
          <label className="mb-2 block text-sm font-bold">제목</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="제목을 입력하세요" required />
        </section>

        <section>
          <label className="mb-2 block text-sm font-bold">내용</label>
          <Textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="자유롭게 작성해보세요."
            maxLength={5000}
            required
          />
        </section>

        <section>
          <label className="mb-2 block text-sm font-bold">이미지 ({images.length}/{MAX_FILES})</label>
          <p className="mb-2 text-xs text-muted-foreground">jpg, png, webp · 장당 최대 5MB</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-pitch hover:bg-secondary/50">
              <ImagePlus className="h-6 w-6" />
              <span className="text-xs font-semibold">이미지 추가</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
              />
            </label>
            {images.map((img, i) => (
              <div key={img.preview} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                <img src={img.preview} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  aria-label="이미지 삭제"
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2 pt-2">
          <Link to="/community" className="flex h-11 flex-1 items-center justify-center rounded-md border border-border text-sm font-semibold hover:bg-secondary">
            취소
          </Link>
          <Button type="submit" disabled={submitting} className="h-11 flex-1 gap-2">
            <Upload className="h-4 w-4" />
            {submitting ? "게시 중..." : "게시하기"}
          </Button>
        </div>
      </form>
    </main>
  );
}