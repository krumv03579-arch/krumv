import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { BrandMark } from "@/components/brand";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { getRemember, saveRemember } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "로그인 — pulseroom" },
      {
        name: "description",
        content: "pulseroom에 로그인하고 팬룸 활동을 이어가세요.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepEmail, setKeepEmail] = useState(false);
  const [keepPassword, setKeepPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  // Prefill from the values saved on this browser (client-only).
  useEffect(() => {
    const remembered = getRemember();
    setKeepEmail(remembered.keepEmail);
    setKeepPassword(remembered.keepPassword);
    if (remembered.email) setEmail(remembered.email);
    if (remembered.password) setPassword(remembered.password);
  }, []);

  useEffect(() => {
    if (user) void navigate({ to: "/" });
  }, [user, navigate]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");

    const result = await signIn({ email, password });
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    saveRemember({ keepEmail, keepPassword, email, password });
    toast.success(`${result.user.nickname}님, 다시 오셨네요!`);
    void navigate({ to: "/" });
  }

  function toggleKeepEmail(next: boolean) {
    setKeepEmail(next);
    // Saving the password without the id makes no sense — drop both together.
    if (!next) setKeepPassword(false);
  }

  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[var(--shadow-card)] md:grid-cols-2">
        <div className="relative hidden md:block">
          <img
            src="/img/hero-stage.svg"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08071a]/90 via-[#08071a]/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-white">
            <p className="eyebrow text-white/60">Welcome back</p>
            <p className="mt-3 text-[26px] font-black leading-tight tracking-[-0.03em]">
              오늘의 무대를
              <br />
              함께 기록해요
            </p>
            <p className="mt-3 text-[13px] text-white/70">
              팔로우한 아티스트의 소식이 가장 먼저 도착합니다.
            </p>
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-8 w-8" />
            <span className="text-xl font-extrabold tracking-[-0.02em]">
              pulseroom
            </span>
          </div>

          <h1 className="mt-8 text-[26px] font-black tracking-[-0.03em]">
            로그인
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            팬룸 활동, 좋아요, 저장한 글을 이어서 볼 수 있어요.
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
            <div>
              <label htmlFor="login-email" className="text-[13px] font-bold">
                이메일
              </label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                placeholder="pulse@example.com"
                autoComplete="email"
                className="mt-2 h-11"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="text-[13px] font-bold">
                비밀번호
              </label>
              <div className="relative mt-2">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? "비밀번호 가리기" : "비밀번호 보기"
                  }
                  className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-[13px] font-semibold">
                <Checkbox
                  checked={keepEmail}
                  onCheckedChange={(value) => toggleKeepEmail(value === true)}
                />
                아이디 저장
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-[13px] font-semibold text-foreground/90">
                <Checkbox
                  checked={keepPassword}
                  disabled={!keepEmail}
                  onCheckedChange={(value) => setKeepPassword(value === true)}
                />
                <span
                  className={keepEmail ? undefined : "text-muted-foreground"}
                >
                  비밀번호 저장
                </span>
              </label>
            </div>

            {error && (
              <p className="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-[13px] font-semibold text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-2 w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {pending ? "로그인 중…" : "로그인"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-[12px] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            또는
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-1 gap-2">
            {["카카오로 계속하기", "구글로 계속하기"].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => toast("소셜 로그인도 곧 연결할 예정이에요.")}
                className="w-full rounded-full border border-border py-3 text-sm font-bold transition-colors hover:bg-secondary"
              >
                {label}
              </button>
            ))}
          </div>

          <p className="mt-7 text-center text-[13px] text-muted-foreground">
            아직 계정이 없으신가요?{" "}
            <Link
              to="/signup"
              className="font-bold text-primary hover:underline"
            >
              회원가입
            </Link>
          </p>

          <p className="mt-6 rounded-xl bg-secondary/70 px-4 py-3 text-[12px] leading-relaxed text-muted-foreground">
            로그인 정보는 Supabase에서 확인합니다. 아래에 저장한 아이디와
            비밀번호는 이 브라우저에만 남으니 공용 PC에서는 저장을 꺼주세요.
          </p>
        </div>
      </div>
    </main>
  );
}
