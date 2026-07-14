import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import {
  ImagePlus,
  Save,
  Trash2,
  Plus,
  Pencil,
  X,
  Clock,
  CheckCircle2,
  PauseCircle,
  AlarmClock,
  Archive,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import type { CommunityBannerRow } from "@/components/community-banner";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 8 * 1024 * 1024;

type DraftBanner = {
  id: string | null;
  image_url: string;
  href: string;
  alt: string;
  is_external: boolean;
  start_at: Date | null;
  end_at: Date | null;
  is_active: boolean;
};

const blankDraft = (): DraftBanner => {
  const now = new Date();
  const later = new Date(now);
  later.setDate(now.getDate() + 14);
  return {
    id: null,
    image_url: "",
    href: "/community",
    alt: "딜렉스타 커뮤니티 배너",
    is_external: false,
    start_at: now,
    end_at: later,
    is_active: true,
  };
};

function statusOf(b: CommunityBannerRow): { label: string; tone: string; icon: React.ReactNode } {
  const now = Date.now();
  const start = new Date(b.start_at).getTime();
  const end = new Date(b.end_at).getTime();
  if (!b.is_active) return { label: "비활성", tone: "bg-muted text-muted-foreground", icon: <PauseCircle className="h-3.5 w-3.5" /> };
  if (now < start) return { label: "예약", tone: "bg-amber-100 text-amber-800", icon: <AlarmClock className="h-3.5 w-3.5" /> };
  if (now >= end) return { label: "종료", tone: "bg-secondary text-muted-foreground", icon: <Archive className="h-3.5 w-3.5" /> };
  return { label: "노출 중", tone: "bg-pitch/15 text-pitch", icon: <CheckCircle2 className="h-3.5 w-3.5" /> };
}

export function CommunityBannerManager() {
  const { user } = useAuth();
  const [banners, setBanners] = useState<CommunityBannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<DraftBanner | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    setLoading(true);
    const { data, error } = await supabase
      .from("community_banners" as never)
      .select("id,image_url,href,alt,is_external,start_at,end_at,is_active")
      .order("start_at", { ascending: false });
    if (error) setMsg({ type: "err", text: error.message });
    setBanners((data as unknown as CommunityBannerRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  function startCreate() {
    setMsg(null);
    setDraft(blankDraft());
  }

  function startEdit(b: CommunityBannerRow) {
    setMsg(null);
    setDraft({
      id: b.id,
      image_url: b.image_url,
      href: b.href,
      alt: b.alt,
      is_external: b.is_external,
      start_at: new Date(b.start_at),
      end_at: new Date(b.end_at),
      is_active: b.is_active,
    });
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user || !draft) return;
    setMsg(null);
    if (!ALLOWED.includes(file.type)) {
      setMsg({ type: "err", text: "jpg, png, webp만 업로드 가능합니다." });
      return;
    }
    if (file.size > MAX_SIZE) {
      setMsg({ type: "err", text: "이미지 크기는 8MB 이하여야 합니다." });
      return;
    }
    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
      const path = `community-banner/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("site-assets")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data: signed, error: sErr } = await supabase.storage
        .from("site-assets")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (sErr || !signed) throw sErr ?? new Error("URL 생성 실패");
      setDraft({ ...draft, image_url: signed.signedUrl });
    } catch (err) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "업로드 실패" });
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!user || !draft) return;
    setMsg(null);
    if (!draft.image_url.trim() || !draft.href.trim()) {
      setMsg({ type: "err", text: "이미지와 링크 모두 입력해주세요." });
      return;
    }
    if (!draft.start_at || !draft.end_at) {
      setMsg({ type: "err", text: "노출 시작과 종료 일시를 모두 선택해주세요." });
      return;
    }
    if (draft.end_at.getTime() <= draft.start_at.getTime()) {
      setMsg({ type: "err", text: "종료 일시는 시작 일시보다 이후여야 합니다." });
      return;
    }
    setSaving(true);
    const payload = {
      image_url: draft.image_url.trim(),
      href: draft.href.trim(),
      alt: draft.alt.trim() || "딜렉스타 커뮤니티 배너",
      is_external: draft.is_external || /^https?:\/\//i.test(draft.href.trim()),
      start_at: draft.start_at.toISOString(),
      end_at: draft.end_at.toISOString(),
      is_active: draft.is_active,
    };
    const q = draft.id
      ? supabase.from("community_banners" as never).update(payload as never).eq("id", draft.id)
      : supabase
          .from("community_banners" as never)
          .insert({ ...payload, created_by: user.id } as never);
    const { error } = await q;
    setSaving(false);
    if (error) {
      setMsg({ type: "err", text: error.message });
      return;
    }
    setMsg({ type: "ok", text: "저장되었습니다." });
    setDraft(null);
    void refresh();
  }

  async function remove(id: string) {
    if (!confirm("이 배너를 삭제할까요?")) return;
    const { error } = await supabase
      .from("community_banners" as never)
      .delete()
      .eq("id", id);
    if (error) return setMsg({ type: "err", text: error.message });
    void refresh();
  }

  async function toggleActive(b: CommunityBannerRow) {
    const { error } = await supabase
      .from("community_banners" as never)
      .update({ is_active: !b.is_active } as never)
      .eq("id", b.id);
    if (error) return setMsg({ type: "err", text: error.message });
    void refresh();
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          현재 시각이 시작·종료 구간 안에 있는 활성 배너 중 가장 최근 등록된 1개가 커뮤니티에 노출됩니다. 조건에 맞는 배너가 없으면 기본 배너가 표시됩니다.
        </p>
        {!draft && (
          <Button onClick={startCreate} size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            새 배너
          </Button>
        )}
      </div>

      {msg && (
        <p className={`text-sm ${msg.type === "ok" ? "text-pitch" : "text-destructive"}`}>{msg.text}</p>
      )}

      {draft && (
        <div className="space-y-4 rounded-lg border border-border bg-secondary/30 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">{draft.id ? "배너 수정" : "새 배너"}</h3>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="grid h-7 w-7 place-items-center rounded-md hover:bg-secondary"
              aria-label="닫기"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold text-muted-foreground">미리보기 (600×150)</p>
            <div className="overflow-hidden rounded-lg border border-border bg-secondary">
              <div className="relative w-full" style={{ aspectRatio: "600 / 150" }}>
                {draft.image_url ? (
                  <img
                    src={draft.image_url}
                    alt={draft.alt}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-sm text-muted-foreground">
                    이미지를 업로드하거나 URL을 입력하세요
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div>
              <label className="mb-1 block text-xs font-bold">이미지 URL</label>
              <Input
                value={draft.image_url}
                onChange={(e) => setDraft({ ...draft, image_url: e.target.value })}
                placeholder="https://... 또는 업로드 버튼 사용"
              />
            </div>
            <div className="flex items-end">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={onFile}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="gap-2"
              >
                <ImagePlus className="h-4 w-4" />
                {uploading ? "업로드 중..." : "이미지 업로드"}
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold">링크</label>
              <Input
                value={draft.href}
                onChange={(e) => setDraft({ ...draft, href: e.target.value })}
                placeholder="/community 또는 https://..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold">대체 텍스트 (alt)</label>
              <Input
                value={draft.alt}
                onChange={(e) => setDraft({ ...draft, alt: e.target.value })}
                placeholder="배너 설명"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold">노출 시작 일시</label>
              <DateTimePicker
                value={draft.start_at}
                onChange={(v) => setDraft({ ...draft, start_at: v })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold">노출 종료 일시</label>
              <DateTimePicker
                value={draft.end_at}
                onChange={(v) => setDraft({ ...draft, end_at: v })}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.is_active}
                onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
                className="h-4 w-4"
              />
              활성화
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.is_external}
                onChange={(e) => setDraft({ ...draft, is_external: e.target.checked })}
                className="h-4 w-4"
              />
              새 탭에서 열기
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDraft(null)} disabled={saving}>
              취소
            </Button>
            <Button onClick={save} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "저장 중..." : "저장"}
            </Button>
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-bold">등록된 배너 ({banners.length})</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        ) : banners.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            등록된 배너가 없습니다. 기본 배너가 노출됩니다.
          </p>
        ) : (
          <ul className="space-y-2">
            {banners.map((b) => {
              const s = statusOf(b);
              return (
                <li
                  key={b.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-2"
                >
                  <img
                    src={b.image_url}
                    alt=""
                    className="h-14 w-24 shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${s.tone}`}
                      >
                        {s.icon}
                        {s.label}
                      </span>
                      <span className="truncate text-sm font-semibold">{b.alt}</span>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {format(new Date(b.start_at), "yyyy.MM.dd HH:mm")} ~{" "}
                      {format(new Date(b.end_at), "yyyy.MM.dd HH:mm")}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">→ {b.href}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => toggleActive(b)}
                      className="grid h-8 w-8 place-items-center rounded-md hover:bg-secondary"
                      aria-label={b.is_active ? "비활성화" : "활성화"}
                      title={b.is_active ? "비활성화" : "활성화"}
                    >
                      {b.is_active ? (
                        <PauseCircle className="h-4 w-4" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-pitch" />
                      )}
                    </button>
                    <button
                      onClick={() => startEdit(b)}
                      className="grid h-8 w-8 place-items-center rounded-md hover:bg-secondary"
                      aria-label="수정"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(b.id)}
                      className="grid h-8 w-8 place-items-center rounded-md text-destructive hover:bg-destructive/10"
                      aria-label="삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}