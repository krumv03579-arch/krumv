import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { activityBadgeColor, describeActivity } from "@/lib/activity-log";
import { Button } from "@/components/ui/button";
import { RefreshCw, LogIn, UserPlus, FileText, Trash2, MessageSquare, Package, Activity } from "lucide-react";

type LogRow = {
  id: string;
  user_id: string | null;
  actor_name: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

const FILTERS = [
  { key: "all", label: "전체" },
  { key: "auth", label: "로그인/가입", actions: ["login", "signup", "logout"] },
  { key: "post", label: "게시글", actions: ["post_create", "post_delete"] },
  { key: "comment", label: "댓글", actions: ["comment_create", "comment_delete"] },
  { key: "product", label: "상품", actions: ["product_create", "product_delete"] },
] as const;

function ActionIcon({ action }: { action: string }) {
  const cls = "h-3.5 w-3.5";
  if (action === "login") return <LogIn className={cls} />;
  if (action === "signup") return <UserPlus className={cls} />;
  if (action === "post_create") return <FileText className={cls} />;
  if (action === "post_delete") return <Trash2 className={cls} />;
  if (action === "comment_create") return <MessageSquare className={cls} />;
  if (action === "comment_delete") return <Trash2 className={cls} />;
  if (action === "product_create") return <Package className={cls} />;
  if (action === "product_delete") return <Trash2 className={cls} />;
  return <Activity className={cls} />;
}

function relativeTime(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - d);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}초 전`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const day = Math.floor(h / 24);
  if (day < 7) return `${day}일 전`;
  return new Date(iso).toLocaleDateString("ko-KR");
}

export function ActivityLogPanel({ enabled }: { enabled: boolean }) {
  const [filter, setFilter] = useState<string>("all");

  const q = useQuery({
    queryKey: ["admin", "activity-logs"],
    enabled,
    refetchInterval: 15_000,
    queryFn: async (): Promise<LogRow[]> => {
      const { data, error } = await supabase
        .from("activity_logs" as never)
        .select("id,user_id,actor_name,action,target_type,target_id,metadata,created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as unknown as LogRow[];
    },
  });

  const filtered = useMemo(() => {
    const rows = q.data ?? [];
    if (filter === "all") return rows;
    const def = FILTERS.find((f) => f.key === filter);
    if (!def || !("actions" in def)) return rows;
    return rows.filter((r) => (def.actions as readonly string[]).includes(r.action));
  }, [q.data, filter]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              filter === f.key
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => q.refetch()}
          className="ml-auto h-7 gap-1 text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          새로고침
        </Button>
      </div>

      {q.isLoading ? (
        <p className="p-4 text-sm text-muted-foreground">불러오는 중...</p>
      ) : q.error ? (
        <p className="p-4 text-sm text-destructive">활동 로그를 불러오지 못했습니다: {(q.error as Error).message}</p>
      ) : filtered.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted-foreground">기록된 활동이 없습니다.</p>
      ) : (
        <ol className="relative divide-y divide-border">
          {filtered.map((row) => (
            <li key={row.id} className="flex items-start gap-3 px-4 py-3">
              <span
                className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${activityBadgeColor(row.action)}`}
              >
                <ActionIcon action={row.action} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{describeActivity(row)}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  <time dateTime={row.created_at} title={new Date(row.created_at).toLocaleString("ko-KR")}>
                    {relativeTime(row.created_at)}
                  </time>
                  {row.target_id && (
                    <>
                      <span className="mx-1.5">·</span>
                      <span className="font-mono">{row.target_type ?? "target"}:{row.target_id.slice(0, 8)}</span>
                    </>
                  )}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}