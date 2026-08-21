import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  AtSign,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  ShieldAlert,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { Panel } from "@/components/panel";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { NICKNAME_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/lib/auth";
import { cn } from "@/lib/utils";

/** Typed into the leave dialog to confirm the account really should go. */
const DELETE_PHRASE = "탈퇴합니다";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "계정 설정 — deluxla" },
      {
        name: "description",
        content: "닉네임과 비밀번호를 바꾸고, 필요하면 회원 탈퇴할 수 있어요.",
      },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, ready, signOut } = useAuth();
  const navigate = useNavigate();
  // Set when the member signs out or leaves from this page: the session going
  // away is expected then, so the guard below must not race it to /login.
  const leaving = useRef(false);

  // The session is only known after mount, so a signed-out visitor is bounced
  // to the login page instead of being rendered an empty settings form.
  useEffect(() => {
    if (ready && !user && !leaving.current) void navigate({ to: "/login" });
  }, [ready, user, navigate]);

  if (!ready || !user) {
    return (
      <main className="mx-auto w-full max-w-[720px] px-4 py-16 sm:px-6">
        <div className="h-40 animate-pulse rounded-2xl bg-secondary" />
      </main>
    );
  }

  function handleSignOut() {
    leaving.current = true;
    signOut();
    toast.success("로그아웃했어요.");
    void navigate({ to: "/" });
  }

  return (
    <main className="mx-auto w-full max-w-[720px] px-4 pb-16 pt-6 sm:px-6">
      <Link
        to="/me"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        마이페이지
      </Link>

      <div className="mt-4">
        <p className="eyebrow text-primary">Account settings</p>
        <h1 className="mt-2.5 text-[28px] font-black leading-tight tracking-[-0.03em] sm:text-[32px]">
          계정 설정
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          닉네임과 비밀번호를 바꾸고, 더 이상 쓰지 않는 계정은 탈퇴할 수 있어요.
        </p>
      </div>

      <div className="mt-7 space-y-5">
        <EmailCard email={user.email} createdAt={user.createdAt} />
        <NicknameCard />
        <PasswordCard />

        <Panel className="p-5 sm:p-6">
          <SectionTitle icon={LogOut} title="로그아웃" />
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            이 브라우저에서 로그아웃해요. 활동 기록은 그대로 남아 있어요.
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-[13.5px] font-bold transition-colors hover:bg-secondary"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </button>
        </Panel>

        <DeleteAccountCard
          onLeavingChange={(value) => (leaving.current = value)}
        />
      </div>

      <p className="mt-6 rounded-2xl bg-secondary/70 px-4 py-3.5 text-[12px] leading-relaxed text-muted-foreground">
        계정 정보는 Supabase에 저장됩니다. 탈퇴하면 계정과 함께 작성한 글, 댓글,
        좋아요·저장 기록이 서버에서 모두 지워지고 되돌릴 수 없어요.
      </p>
    </main>
  );
}

function EmailCard({ email, createdAt }: { email: string; createdAt: string }) {
  const joinedAt = useMemo(
    () => createdAt.slice(0, 10).replace(/-/g, "."),
    [createdAt],
  );

  return (
    <Panel className="p-5 sm:p-6">
      <SectionTitle icon={AtSign} title="이메일" />
      <p className="mt-3 break-all text-[15px] font-bold">{email}</p>
      <p className="mt-2 text-[12.5px] text-muted-foreground">
        로그인에 쓰는 주소예요. 지금은 변경할 수 없어요.
      </p>
      {joinedAt && (
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          {joinedAt} 가입
        </p>
      )}
    </Panel>
  );
}

function NicknameCard() {
  const { user, updateNickname } = useAuth();
  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const trimmed = nickname.trim();
  const tooLong = trimmed.length > NICKNAME_MAX_LENGTH;
  const changed = trimmed !== user?.nickname;
  const canSubmit = trimmed.length > 0 && !tooLong && changed && !pending;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const result = await updateNickname(nickname);
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }
    setError("");
    setNickname(result.user.nickname);
    toast.success("닉네임을 바꿨어요.", {
      description: `이제 ${result.user.nickname}(으)로 보여요.`,
    });
  }

  return (
    <Panel className="p-5 sm:p-6">
      <SectionTitle icon={UserRound} title="닉네임" />
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        글쓰기와 댓글에 표시되는 이름이에요.
      </p>

      <form onSubmit={submit} className="mt-4" noValidate>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <div className="flex-1">
            <Input
              id="account-nickname"
              value={nickname}
              onChange={(event) => {
                setNickname(event.target.value);
                setError("");
              }}
              aria-label="닉네임"
              placeholder="팬룸에서 보일 이름"
              autoComplete="nickname"
              className="h-11"
            />
          </div>
          <button
            type="submit"
            disabled={!canSubmit}
            className="h-11 shrink-0 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-45 sm:rounded-full"
          >
            {pending ? "저장 중…" : "저장"}
          </button>
        </div>
        <p
          className={cn(
            "mt-2 text-[11.5px] font-semibold",
            tooLong ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {trimmed.length}/{NICKNAME_MAX_LENGTH}자
        </p>
        {error && <FormError message={error} />}
      </form>
    </Panel>
  );
}

function PasswordCard() {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const lengthOk = next.length >= PASSWORD_MIN_LENGTH;
  const matches = confirm.length > 0 && confirm === next;
  const canSubmit = current.length > 0 && lengthOk && matches && !pending;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (next !== confirm) {
      setError("새 비밀번호가 서로 달라요.");
      return;
    }

    setPending(true);
    setError("");
    const result = await changePassword({
      currentPassword: current,
      nextPassword: next,
    });
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setCurrent("");
    setNext("");
    setConfirm("");
    toast.success("비밀번호를 바꿨어요.", {
      description: "다음 로그인부터 새 비밀번호를 사용해 주세요.",
    });
  }

  return (
    <Panel className="p-5 sm:p-6">
      <SectionTitle icon={KeyRound} title="비밀번호 변경" />
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        현재 비밀번호를 확인한 뒤 새 비밀번호로 바꿔요.
      </p>

      <form onSubmit={submit} className="mt-4 space-y-4" noValidate>
        <PasswordField
          id="account-current-password"
          label="현재 비밀번호"
          value={current}
          onChange={(value) => {
            setCurrent(value);
            setError("");
          }}
          autoComplete="current-password"
        />
        <PasswordField
          id="account-next-password"
          label="새 비밀번호"
          hint={`${PASSWORD_MIN_LENGTH}자 이상`}
          hintTone={next.length > 0 && !lengthOk ? "error" : "muted"}
          done={lengthOk}
          value={next}
          onChange={(value) => {
            setNext(value);
            setError("");
          }}
          autoComplete="new-password"
        />
        <PasswordField
          id="account-confirm-password"
          label="새 비밀번호 확인"
          hint={
            confirm.length > 0 && !matches
              ? "비밀번호가 서로 달라요."
              : undefined
          }
          hintTone="error"
          done={matches}
          value={confirm}
          onChange={(value) => {
            setConfirm(value);
            setError("");
          }}
          autoComplete="new-password"
        />

        {error && <FormError message={error} />}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:px-6"
        >
          {pending ? "변경 중…" : "비밀번호 변경"}
        </button>
      </form>
    </Panel>
  );
}

function DeleteAccountCard({
  onLeavingChange,
}: {
  onLeavingChange: (leaving: boolean) => void;
}) {
  const { deleteAccount } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [phrase, setPhrase] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const canSubmit =
    password.length > 0 && phrase.trim() === DELETE_PHRASE && !pending;

  function close(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setPassword("");
      setPhrase("");
      setError("");
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");

    // Flagged up front: the session disappears inside deleteAccount, and the
    // page guard must not read that as a signed-out visitor.
    onLeavingChange(true);
    const result = await deleteAccount({ password });
    setPending(false);

    if (!result.ok) {
      onLeavingChange(false);
      setError(result.message);
      return;
    }

    setOpen(false);
    toast.success("탈퇴가 완료됐어요.", {
      description: "그동안 딜렉스타를 찾아주셔서 고마웠어요.",
    });
    void navigate({ to: "/" });
  }

  return (
    <Panel className="border-destructive/25 bg-destructive/[0.03] p-5 sm:p-6">
      <SectionTitle icon={ShieldAlert} title="회원 탈퇴" tone="destructive" />
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        계정과 함께 작성한 글, 댓글, 좋아요와 저장 목록이 모두 사라져요. 한 번
        탈퇴하면 되돌릴 수 없어요.
      </p>

      <button
        type="button"
        onClick={() => close(true)}
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-destructive/30 px-5 py-2.5 text-[13.5px] font-bold text-destructive transition-colors hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
        회원 탈퇴
      </button>

      <AlertDialog open={open} onOpenChange={close}>
        <AlertDialogContent className="max-w-[440px]">
          <AlertDialogHeader>
            <AlertDialogTitle>정말 탈퇴하시겠어요?</AlertDialogTitle>
            <AlertDialogDescription>
              계정과 활동 기록이 이 브라우저에서 완전히 지워지고 복구할 수
              없어요. 계속하려면 비밀번호와 확인 문구를 입력해 주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <form onSubmit={submit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="delete-password"
                className="mb-2 block text-[13px] font-bold"
              >
                비밀번호
              </label>
              <Input
                id="delete-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-11"
              />
            </div>

            <div>
              <label
                htmlFor="delete-phrase"
                className="mb-2 block text-[13px] font-bold"
              >
                <span className="font-black text-destructive">
                  {DELETE_PHRASE}
                </span>
                를 입력해 주세요
              </label>
              <Input
                id="delete-phrase"
                value={phrase}
                onChange={(event) => {
                  setPhrase(event.target.value);
                  setError("");
                }}
                placeholder={DELETE_PHRASE}
                autoComplete="off"
                className="h-11"
              />
            </div>

            {error && <FormError message={error} />}

            <AlertDialogFooter>
              <AlertDialogCancel type="button">취소</AlertDialogCancel>
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex h-10 items-center justify-center rounded-full bg-destructive px-5 text-sm font-bold text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {pending ? "처리 중…" : "탈퇴하기"}
              </button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </Panel>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tone?: "default" | "destructive";
}) {
  return (
    <h2
      className={cn(
        "flex items-center gap-2 text-[15.5px] font-extrabold tracking-[-0.02em]",
        tone === "destructive" && "text-destructive",
      )}
    >
      <Icon className="h-4 w-4" />
      {title}
    </h2>
  );
}

function PasswordField({
  id,
  label,
  hint,
  hintTone = "muted",
  done,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  hint?: string;
  hintTone?: "muted" | "error";
  done?: boolean;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);

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
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="••••••••"
          autoComplete={autoComplete}
          className="h-11 pr-11"
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? "비밀번호 가리기" : "비밀번호 보기"}
          className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

function FormError({ message }: { message: string }) {
  return (
    <p className="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-[13px] font-semibold text-destructive">
      {message}
    </p>
  );
}
