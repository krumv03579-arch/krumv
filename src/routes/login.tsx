import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { BrandMark } from "@/components/brand";
import { Input } from "@/components/ui/input";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    toast("로그인은 아직 준비 중이에요.", {
      description: "지금은 프론트엔드 화면만 구현된 단계입니다.",
    });
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

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div>
              <label htmlFor="email" className="text-[13px] font-bold">
                이메일
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="pulse@example.com"
                className="mt-2 h-11"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="text-[13px] font-bold">
                비밀번호
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="mt-2 h-11"
                required
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              로그인
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-[12px] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            또는
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-2">
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
            <Link to="/feed" className="font-bold text-primary hover:underline">
              둘러보기부터 시작하기
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
