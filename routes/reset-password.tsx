import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase가 URL의 recovery 토큰으로 세션을 생성할 때까지 잠시 대기
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) return setError("6자 이상 입력해주세요.");
    if (password !== confirm) return setError("비밀번호가 일치하지 않습니다.");
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col justify-center px-4 py-10">
      <h1 className="text-2xl font-black tracking-tight">비밀번호 재설정</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {ready ? "새 비밀번호를 입력해주세요." : "재설정 링크를 확인하는 중..."}
      </p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-semibold">새 비밀번호</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold">비밀번호 확인</label>
          <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={6} required />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading || !ready} className="w-full">
          {loading ? "처리 중..." : "비밀번호 변경"}
        </Button>
      </form>
      <Link to="/auth" className="mt-4 text-sm text-muted-foreground hover:text-foreground">
        ← 로그인으로
      </Link>
    </main>
  );
}