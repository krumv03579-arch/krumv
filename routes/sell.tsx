import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X, Upload, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { logActivity } from "@/lib/activity-log";

export const Route = createFileRoute("/sell")({
  ssr: false,
  component: SellPage,
});

const SIZES = ["S", "M", "L", "XL"] as const;
const CONDITIONS = ["새상품", "중고"] as const;

interface ImageItem {
  file: File;
  preview: string;
}

function SellPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [team, setTeam] = useState("");
  const [size, setSize] = useState<(typeof SIZES)[number]>("L");
  const [condition, setCondition] = useState<(typeof CONDITIONS)[number]>("새상품");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
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
    const fresh: ImageItem[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) {
        setError("이미지는 장당 5MB 이하만 가능합니다.");
        continue;
      }
      fresh.push({ file, preview: URL.createObjectURL(file) });
    }
    setImages((prev) => [...prev, ...fresh].slice(0, 10));
  }

  function removeImage(idx: number) {
    setImages((prev) => {
      const next = [...prev];
      const [removed] = next.splice(idx, 1);
      if (removed) URL.revokeObjectURL(removed.preview);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);

    if (images.length === 0) {
      setError("이미지를 1장 이상 업로드해주세요.");
      return;
    }
    const priceNum = Number(price.replace(/,/g, ""));
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setError("올바른 가격을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload images
      const urls: string[] = [];
      for (const img of images) {
        const ext = img.file.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("product-images")
          .upload(path, img.file, { contentType: img.file.type, upsert: false });
        if (upErr) throw upErr;
        const { data: signed, error: sErr } = await supabase.storage
          .from("product-images")
          .createSignedUrl(path, 60 * 60 * 24 * 365 * 10); // 10 years
        if (sErr || !signed) throw sErr ?? new Error("URL 생성 실패");
        urls.push(signed.signedUrl);
      }

      // 2. Insert product row
      const { error: insErr } = await supabase.from("products").insert({
        user_id: user.id,
        title: title.trim(),
        team: team.trim(),
        size,
        condition,
        price: Math.round(priceNum),
        description: description.trim() || null,
        images: urls,
      });
      if (insErr) throw insErr;

      await logActivity({ action: "product_create", targetType: "product", metadata: { title: title.trim() } });
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다.");
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
          <h1 className="text-2xl font-black tracking-tight">상품 등록</h1>
          <p className="mt-1 text-sm text-muted-foreground">정확한 정보로 안전하게 거래하세요.</p>
        </div>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">취소</Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images */}
        <section>
          <label className="mb-2 block text-sm font-bold">상품 이미지 ({images.length}/10)</label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-pitch hover:bg-secondary/50">
              <ImagePlus className="h-6 w-6" />
              <span className="text-xs font-semibold">이미지 추가</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
              />
            </label>
            {images.map((img, i) => (
              <div key={img.preview} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                <img src={img.preview} alt="" className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-pitch px-1.5 py-0.5 text-[10px] font-bold text-white">대표</span>
                )}
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

        <Field label="제목">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 손흥민 마킹 대한민국 홈 26-28"
            required
            maxLength={80}
          />
        </Field>

        <Field label="팀">
          <Input
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            placeholder="예: 대한민국 홈, 레알 마드리드 홈"
            required
            maxLength={50}
          />
        </Field>

        <Field label="사이즈">
          <div className="flex flex-wrap gap-2">
            {SIZES.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setSize(s)}
                className={`h-10 min-w-14 rounded-md border px-4 text-sm font-bold transition-colors ${
                  size === s ? "border-pitch bg-pitch text-white" : "border-border bg-background hover:bg-secondary"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>

        <Field label="상태">
          <div className="flex gap-2">
            {CONDITIONS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setCondition(c)}
                className={`h-10 flex-1 rounded-md border text-sm font-bold transition-colors ${
                  condition === c ? "border-pitch bg-pitch text-white" : "border-border bg-background hover:bg-secondary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Field>

        <Field label="가격 (원)">
          <Input
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/[^\d,]/g, ""))}
            placeholder="예: 120000"
            required
          />
        </Field>

        <Field label="상세 설명">
          <Textarea
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="브랜드, 마킹, 패치, 사이즈 실측, 컨디션 등을 자세히 적어주세요."
            maxLength={2000}
          />
        </Field>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2 pt-2">
          <Link to="/" className="flex h-11 flex-1 items-center justify-center rounded-md border border-border text-sm font-semibold hover:bg-secondary">
            취소
          </Link>
          <Button type="submit" disabled={submitting} className="h-11 flex-1 gap-2">
            <Upload className="h-4 w-4" />
            {submitting ? "등록 중..." : "상품 등록"}
          </Button>
        </div>
      </form>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <label className="mb-2 block text-sm font-bold">{label}</label>
      {children}
    </section>
  );
}