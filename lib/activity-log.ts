import { supabase } from "@/integrations/supabase/client";

export type ActivityAction =
  | "login"
  | "signup"
  | "logout"
  | "post_create"
  | "post_delete"
  | "comment_create"
  | "comment_delete"
  | "product_create"
  | "product_delete";

export interface LogActivityInput {
  action: ActivityAction;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}

async function resolveActorName(userId: string, email?: string | null): Promise<string> {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle();
    if (data?.display_name) return data.display_name;
  } catch {
    // ignore
  }
  if (email) return email.split("@")[0];
  return `user_${userId.slice(0, 6)}`;
}

export async function logActivity(input: LogActivityInput): Promise<void> {
  try {
    const { data: sess } = await supabase.auth.getUser();
    const user = sess.user;
    if (!user) return;
    const actorName = await resolveActorName(user.id, user.email);
    await supabase.from("activity_logs" as never).insert({
      user_id: user.id,
      actor_name: actorName,
      action: input.action,
      target_type: input.targetType ?? null,
      target_id: input.targetId ?? null,
      metadata: (input.metadata ?? {}) as never,
    } as never);
  } catch (err) {
    console.warn("[activity-log] failed", err);
  }
}

export function describeActivity(row: {
  actor_name: string | null;
  action: string;
  target_type: string | null;
  metadata: Record<string, unknown> | null;
}): string {
  const name = row.actor_name?.trim() || "익명";
  const meta = row.metadata ?? {};
  const title = typeof meta.title === "string" ? ` "${meta.title}"` : "";
  switch (row.action) {
    case "login":
      return `${name} 님이 로그인 성공`;
    case "signup":
      return `${name} 님이 회원가입 완료`;
    case "logout":
      return `${name} 님이 로그아웃`;
    case "post_create":
      return `${name} 님이 게시글${title} 작성`;
    case "post_delete":
      return `${name} 님이 게시글${title} 삭제`;
    case "comment_create":
      return `${name} 님이 댓글 작성`;
    case "comment_delete":
      return `${name} 님이 댓글 삭제`;
    case "product_create":
      return `${name} 님이 상품${title} 등록`;
    case "product_delete":
      return `${name} 님이 상품${title} 삭제`;
    default:
      return `${name} 님이 ${row.action}`;
  }
}

export function activityBadgeColor(action: string): string {
  if (action.endsWith("_delete")) return "bg-red-100 text-red-700";
  if (action === "login" || action === "signup") return "bg-blue-100 text-blue-700";
  if (action.endsWith("_create")) return "bg-green-100 text-green-700";
  return "bg-secondary text-foreground";
}