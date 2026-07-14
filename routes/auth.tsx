import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logActivity } from "@/lib/activity-log";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  component: AuthPage,
});

function safeRedirect(target: string | undefined): string {
  // Only allow same-origin internal paths (leading "/", not "//" or protocol).
  if (!target) return "/";
  if (!target.startsWith("/")) return "/";
  if (target.startsWith("//")) return "/";
  return target;
}

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const redirectTo = safeRedirect(search.redirect);
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: redirectTo });
    });
  }, [navigate, redirectTo]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setInfo("비밀번호 찾기 메일을 보냈어요. 메일함을 확인해주세요.");
        return;
      }
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        // 이메일 인증이 꺼져있어 즉시 세션이 생성됨. 혹시 없으면 바로 로그인 시도.
        if (!data.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) throw signInError;
        }
        await logActivity({ action: "signup", metadata: { email } });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await logActivity({ action: "login", metadata: { email } });
      }
      navigate({ to: redirectTo });
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col justify-center px-4 py-10">
      <h1 className="text-2xl font-black tracking-tight">
        {mode === "signin" ? "로그인" : mode === "signup" ? "회원가입" : "비밀번호 찾기"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {mode === "forgot"
          ? "가입한 이메일로 비밀번호 찾기 링크를 보내드려요."
          : "딜렉스타에 오신 것을 환영합니다."}
      </p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-semibold">이메일</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        {mode !== "forgot" && (
          <div className="space-y-1">
            <label className="text-sm font-semibold">비밀번호</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
            {mode === "signup" && (
              <p className="text-xs text-muted-foreground">6자 이상 입력해주세요.</p>
            )}
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {info && <p className="text-sm text-foreground">{info}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading
            ? "처리 중..."
            : mode === "signin"
              ? "로그인"
              : mode === "signup"
                ? "가입하기"
                : "비밀번호 찾기"}
        </Button>
      </form>
      <div className="mt-4 flex flex-col gap-2 text-sm">
        {mode === "signin" && (
          <>
            <button
              type="button"
              onClick={() => { setError(null); setInfo(null); setMode("signup"); }}
              className="text-left text-muted-foreground hover:text-foreground"
            >
              계정이 없으신가요? 회원가입
            </button>
            <button
              type="button"
              onClick={() => { setError(null); setInfo(null); setMode("forgot"); }}
              className="text-left text-muted-foreground hover:text-foreground"
            >
              비밀번호 찾기
            </button>
            <p className="text-xs text-muted-foreground">
              아이디(이메일)가 기억나지 않으시면 가입 시 사용한 메일함에서 "딜렉스타" 발신 메일을 검색해보세요.
            </p>
          </>
        )}
        {mode === "signup" && (
          <button
            type="button"
            onClick={() => { setError(null); setInfo(null); setMode("signin"); }}
            className="text-left text-muted-foreground hover:text-foreground"
          >
            이미 계정이 있으신가요? 로그인
          </button>
        )}
        {mode === "forgot" && (
          <button
            type="button"
            onClick={() => { setError(null); setInfo(null); setMode("signin"); }}
            className="text-left text-muted-foreground hover:text-foreground"
          >
            ← 로그인으로 돌아가기
          </button>
        )}
      </div>
      <Link to="/" className="mt-2 text-sm text-muted-foreground hover:text-foreground">
        ← 홈으로
      </Link>
    </main>
  );
}