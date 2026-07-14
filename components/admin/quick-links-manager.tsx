import { useEffect, useRef, useState } from "react";
import { ImagePlus, Save, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const MAX_SIZE = 4 * 1024 * 1024;

export interface QuickLink {
  id: string;
  sort_order: number;
  image_url: string | null;
  label: string;
  link_url: string;
  is_active: boolean;
}

export function QuickLinksManager() {
  const { user } = useAuth();
  const [rows, setRows] = useState<QuickLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function refresh() {
    setLoading(true);
    const { data, error } = await supabase
      .from("quick_links" as never)
      .select("id,sort_order,image_url,label,link_url,is_active")
      .order("sort_order", { ascending: true });
    if (error) setMsg({ type: "err", text: error.message });
    setRows((data as unknown as QuickLink[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  function update(id: string, patch: Partial<QuickLink>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function onFile(id: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    setMsg(null);
    if (!ALLOWED.includes(file.type)) {
      setMsg({ type: "err", text: "jpg, png, webp, svg만 업로드 가능합니다." });
      return;
    }
    if (file.size > MAX_SIZE) {
      setMsg({ type: "err", text: "이미지 크기는 4MB 이하여야 합니다." });
      return;
    }
    setUploadingId(id);
    try {
      const ext = (file.name.split(".").pop() ?? "png").toLowerCase();
      const path = `quick-link/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("site-assets")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data: signed, error: sErr } = await supabase.storage
        .from("site-assets")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (sErr || !signed) throw sErr ?? new Error("URL 생성 실패");
      update(id, { image_url: signed.signedUrl });
    } catch (err) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "업로드 실패" });
    } finally {
      setUploadingId(null);
    }
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = rows.findIndex((r) => r.id === id);
    const swapIdx = idx + dir;
    if (idx < 0 || swapIdx < 0 || swapIdx >= rows.length) return;
    const a = rows[idx];
    const b = rows[swapIdx];
    // Swap in UI immediately; commit on save.
    const next = [...rows];
    next[idx] = { ...b, sort_order: a.sort_order };
    next[swapIdx] = { ...a, sort_order: b.sort_order };
    setRows(next);
  }

  async function saveAll() {
    setSaving(true);
    setMsg(null);
    try {
      // Two-phase to avoid unique(sort_order) collisions: bump to negative, then final values.
      for (const r of rows) {
        const { error } = await supabase
          .from("quick_links" as never)
          .update({ sort_order: -Math.abs(r.sort_order) - 1000 } as never)
          .eq("id", r.id);
        if (error) throw error;
      }
      for (const r of rows) {
        const { error } = await supabase
          .from("quick_links" as never)
          .update({
            sort_order: r.sort_order,
            image_url: r.image_url,
            label: r.label.trim() || "슬롯",
            link_url: r.link_url.trim() || "/",
            is_active: r.is_active,
          } as never)
          .eq("id", r.id);
        if (error) throw error;
      }
      setMsg({ type: "ok", text: "저장되었습니다." });
      await refresh();
    } catch (err) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "저장 실패" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          홈 화면 상단 6개 원형 바로가기를 관리합니다. 이미지/라벨/링크/노출 여부를 편집하고 순서를 바꾼 뒤 저장하세요.
          내부 경로(예: <span className="font-mono">/market</span>)와 외부 URL(<span className="font-mono">https://…</span>) 모두 지원합니다.
        </p>
        <Button onClick={saveAll} disabled={saving || loading} size="sm" className="gap-1">
          <Save className="h-4 w-4" />
          {saving ? "저장 중..." : "전체 저장"}
        </Button>
      </div>

      {msg && (
        <p className={`text-sm ${msg.type === "ok" ? "text-pitch" : "text-destructive"}`}>{msg.text}</p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">등록된 슬롯이 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r, i) => (
            <li
              key={r.id}
              className="grid gap-3 rounded-lg border border-border bg-card p-3 md:grid-cols-[auto_88px_1fr_auto]"
            >
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(r.id, -1)}
                  disabled={i === 0}
                  className="grid h-8 w-8 place-items-center rounded-md hover:bg-secondary disabled:opacity-30"
                  aria-label="위로"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(r.id, 1)}
                  disabled={i === rows.length - 1}
                  className="grid h-8 w-8 place-items-center rounded-md hover:bg-secondary disabled:opacity-30"
                  aria-label="아래로"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <span className="ml-1 w-6 text-center text-sm font-bold text-muted-foreground">
                  {i + 1}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-secondary">
                  {r.image_url ? (
                    <img src={r.image_url} alt={r.label} className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlus className="h-5 w-5 text-muted-foreground/60" />
                  )}
                </div>
                <input
                  ref={(el) => {
                    fileRefs.current[r.id] = el;
                  }}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => onFile(r.id, e)}
                />
                <button
                  type="button"
                  onClick={() => fileRefs.current[r.id]?.click()}
                  disabled={uploadingId === r.id}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                >
                  {uploadingId === r.id ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" /> 업로드
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-3 w-3" /> 이미지
                    </>
                  )}
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-muted-foreground">라벨</label>
                  <Input
                    value={r.label}
                    onChange={(e) => update(r.id, { label: e.target.value })}
                    placeholder="예: 마켓"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-muted-foreground">링크 URL</label>
                  <Input
                    value={r.link_url}
                    onChange={(e) => update(r.id, { link_url: e.target.value })}
                    placeholder="/market 또는 https://..."
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 self-center text-sm">
                <input
                  type="checkbox"
                  checked={r.is_active}
                  onChange={(e) => update(r.id, { is_active: e.target.checked })}
                  className="h-4 w-4"
                />
                노출
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}