import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { BrandWordmark } from "@/components/brand";
import { Input } from "@/components/ui/input";
import {
  isValidEmail,
  NICKNAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "회원가입 — deluxla" },
      {
        name: "description",
        content:
          "이메일, 비밀번호, 닉네임만 있으면 딜렉스타 팬룸 활동을 시작할 수 있어요.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (user) void navigate({ to: "/" });
  }, [user, navigate]);

  const emailOk = isValidEmail(email);
  const passwordOk = password.length >= PASSWORD_MIN_LENGTH;
  const nicknameOk =
    nickname.trim().length > 0 && nickname.trim().length <= NICKNAME_MAX_LENGTH;
  const canSubmit = emailOk && passwordOk && nicknameOk && !pending;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");

    const result = await signUp({ email, password, nickname });
    setPending(false);

    if (!result.ok) {
      // With email confirmation switched on there is no session yet — that is
      // not a failure, so it goes to the login screen with a note instead of
      // turning the form red.
      if (result.kind === "notice") {
        toast.success("가입 신청이 접수됐어요.", {
          description: result.message,
        });
        void navigate({ to: "/login" });
        return;
      }
      setError(result.message);
      return;
    }

    toast.success(`${result.user.nickname}님, 환영해요!`, {
      description: "가입이 완료돼 바로 로그인됐어요.",
    });
    void navigate({ to: "/" });
  }

  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[var(--shadow-card)] md:grid-cols-2">
        <div className="relative hidden md:block">
          <img
            src="/img/hero-sunset.svg"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08071a]/90 via-[#08071a]/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-white">
            <p className="eyebrow text-white/60">Join deluxla</p>
            <p className="mt-3 text-[26px] font-black leading-tight tracking-[-0.03em]">
              세 가지만 적으면
              <br />
              팬룸이 열려요
            </p>
            <p className="mt-3 text-[13px] text-white/70">
              이메일 · 비밀번호 · 닉네임. 그게 전부입니다.
            </p>
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <BrandWordmark className="h-[26px]" />

          <h1 className="mt-8 text-[26px] font-black tracking-[-0.03em]">
            회원가입
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            가입하면 바로 로그인되고, 글쓰기와 댓글에 닉네임이 사용돼요.
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
            <Field
              id="signup-email"
              label="이메일"
              hint={
                email.length > 0 && !emailOk
                  ? "이메일 형식을 확인해 주세요."
                  : undefined
              }
              done={emailOk}
            >
              <Input
                id="signup-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                placeholder="pulse@example.com"
                autoComplete="email"
                className="h-11"
              />
            </Field>

            <Field
              id="signup-password"
              label="비밀번호"
              hint={`${PASSWORD_MIN_LENGTH}자 이상`}
              hintTone={password.length > 0 && !passwordOk ? "error" : "muted"}
              done={passwordOk}
            >
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
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
            </Field>

            <Field
              id="signup-nickname"
              label="닉네임"
              hint={`${nickname.trim().length}/${NICKNAME_MAX_LENGTH}자`}
              hintTone={
                nickname.trim().length > NICKNAME_MAX_LENGTH ? "error" : "muted"
              }
              done={nicknameOk}
            >
              <Input
                id="signup-nickname"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="팬룸에서 보일 이름"
                autoComplete="nickname"
                className="h-11"
              />
            </Field>

            {error && (
              <p className="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-[13px] font-semibold text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-2 w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {pending ? "가입 중…" : "가입하고 시작하기"}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link
              to="/login"
              className="font-bold text-primary hover:underline"
            >
              로그인
            </Link>
          </p>

          <p className="mt-6 rounded-xl bg-secondary/70 px-4 py-3 text-[12px] leading-relaxed text-muted-foreground">
            계정은 Supabase 인증으로 안전하게 관리됩니다. 비밀번호는 서버에
            해시로만 저장되며 딜렉스타는 원문을 보관하지 않아요.
          </p>
        </div>
      </div>
    </main>
  );
}

function Field({
  id,
  label,
  hint,
  hintTone = "muted",
  done,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  hintTone?: "muted" | "error";
  done?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <label htmlFor={id} className="text-[13px] font-bold">
          {label}
        </label>
        {done && <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden />}
        {hint && (
          <span
            className={cn(
              "ml-auto text-[11.5px] font-semibold",
              hintTone === "error"
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
