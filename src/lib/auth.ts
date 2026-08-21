/**
 * Accounts, backed by Supabase Auth.
 *
 * The nickname is written to the account's user metadata on signup, which a
 * database trigger mirrors into `public.profiles` so other members' posts can
 * show a name. Reads prefer the metadata copy: it arrives with the session and
 * keeps working even before the profiles table exists.
 *
 * The "remember me" values are the one thing that stays in this browser — they
 * only exist to refill the login form.
 */

import type { AuthError, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

import { readJson, removeKey, writeJson } from "./browser-store";

const REMEMBER_KEY = "pulseroom:remember:v1";

export const PASSWORD_MIN_LENGTH = 6;
export const NICKNAME_MAX_LENGTH = 12;

export type SessionUser = {
  /** auth.users id — the owner column on every post, comment and reaction. */
  id: string;
  email: string;
  nickname: string;
  createdAt: string;
};

export type RememberState = {
  keepEmail: boolean;
  keepPassword: boolean;
  email: string;
  password: string;
};

export const emptyRemember: RememberState = {
  keepEmail: false,
  keepPassword: false,
  email: "",
  password: "",
};

export type AuthResult =
  | { ok: true; user: SessionUser }
  /** `notice` covers outcomes that are not failures, such as a pending email confirmation. */
  | { ok: false; message: string; kind: "error" | "notice" };

function fail(message: string): AuthResult {
  return { ok: false, message, kind: "error" };
}

function notice(message: string): AuthResult {
  return { ok: false, message, kind: "notice" };
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/* ------------------------------------------------------------------ */
/* Session                                                             */
/* ------------------------------------------------------------------ */

function nicknameOf(user: User) {
  const meta = user.user_metadata ?? {};
  const fromMeta =
    (typeof meta.nickname === "string" && meta.nickname.trim()) ||
    (typeof meta.display_name === "string" && meta.display_name.trim());
  if (fromMeta) return fromMeta;
  return user.email?.split("@")[0] || "팬룸 멤버";
}

export function toSessionUser(user: User): SessionUser {
  return {
    id: user.id,
    email: user.email ?? "",
    nickname: nicknameOf(user),
    createdAt: user.created_at,
  };
}

/**
 * The nickname a member changed after signing up lives in `profiles`; the
 * metadata copy is only written once. A failure here is not worth surfacing —
 * the metadata name is already good enough to render.
 */
export async function withProfileNickname(
  user: SessionUser,
): Promise<SessionUser> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !data?.display_name) return user;
    return { ...user, nickname: data.display_name };
  } catch {
    return user;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  return user ? toSessionUser(user) : null;
}

export async function signOut() {
  await supabase.auth.signOut();
}

/* ------------------------------------------------------------------ */
/* Sign up / sign in                                                   */
/* ------------------------------------------------------------------ */

/** Supabase reports in English; these are the cases a member can actually hit. */
function describeAuthError(error: AuthError): string {
  const message = error.message.toLowerCase();

  if (message.includes("already registered") || error.status === 422) {
    return "이미 가입된 이메일이에요.";
  }
  if (message.includes("invalid login credentials")) {
    return "이메일 또는 비밀번호가 올바르지 않아요.";
  }
  if (message.includes("email not confirmed")) {
    return "이메일 인증이 아직 끝나지 않았어요. 받은 메일의 링크를 눌러주세요.";
  }
  if (message.includes("password should be at least")) {
    return `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상 입력해 주세요.`;
  }
  if (message.includes("email address") && message.includes("invalid")) {
    return "이메일 형식을 확인해 주세요.";
  }
  if (message.includes("rate limit") || error.status === 429) {
    return "요청이 너무 잦아요. 잠시 후 다시 시도해 주세요.";
  }
  if (message.includes("failed to fetch") || message.includes("network")) {
    return "서버에 연결하지 못했어요. 네트워크를 확인해 주세요.";
  }
  return "문제가 생겼어요. 잠시 후 다시 시도해 주세요.";
}

export async function signUp(input: {
  email: string;
  password: string;
  nickname: string;
}): Promise<AuthResult> {
  const email = normalizeEmail(input.email);
  const nickname = input.nickname.trim();

  if (!isValidEmail(email)) return fail("이메일 형식을 확인해 주세요.");
  if (input.password.length < PASSWORD_MIN_LENGTH) {
    return fail(`비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상 입력해 주세요.`);
  }
  if (!nickname) return fail("닉네임을 입력해 주세요.");
  if (nickname.length > NICKNAME_MAX_LENGTH) {
    return fail(`닉네임은 ${NICKNAME_MAX_LENGTH}자 이하로 입력해 주세요.`);
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: { nickname, display_name: nickname },
      emailRedirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/`
          : undefined,
    },
  });

  if (error) return fail(describeAuthError(error));

  // With email confirmation switched on there is no session yet, so the member
  // stays signed out until they follow the link.
  if (!data.session || !data.user) {
    return notice(
      "가입 확인 메일을 보냈어요. 메일의 링크를 열면 로그인이 완료됩니다.",
    );
  }

  return { ok: true, user: toSessionUser(data.user) };
}

export async function signIn(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const email = normalizeEmail(input.email);

  if (!isValidEmail(email)) return fail("이메일 형식을 확인해 주세요.");
  if (!input.password) return fail("비밀번호를 입력해 주세요.");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: input.password,
  });

  if (error) return fail(describeAuthError(error));
  if (!data.user) return fail("로그인에 실패했어요. 다시 시도해 주세요.");

  return { ok: true, user: toSessionUser(data.user) };
}

/* ------------------------------------------------------------------ */
/* Login form prefill (this browser only)                              */
/* ------------------------------------------------------------------ */

export function getRemember(): RememberState {
  return {
    ...emptyRemember,
    ...readJson<Partial<RememberState>>(REMEMBER_KEY, {}),
  };
}

/**
 * Saves what the login form should prefill next time. The password is only
 * kept while both boxes are checked — unchecking either one wipes it.
 */
export function saveRemember(state: RememberState) {
  const keepEmail = state.keepEmail;
  const keepPassword = keepEmail && state.keepPassword;
  if (!keepEmail && !keepPassword) {
    removeKey(REMEMBER_KEY);
    return;
  }
  writeJson(REMEMBER_KEY, {
    keepEmail,
    keepPassword,
    email: keepEmail ? state.email : "",
    password: keepPassword ? state.password : "",
  });
}

/* ------------------------------------------------------------------ */
/* Account settings                                                    */
/* ------------------------------------------------------------------ */

export type ActionResult = { ok: true } | { ok: false; message: string };

function actionFailed(message: string): ActionResult {
  return { ok: false, message };
}

/**
 * Confirms the member is who they say they are before a change that should not
 * ride on a session alone. Supabase has no "verify password" call, so the
 * password is checked by signing in again — the same account, so the session
 * is refreshed rather than replaced.
 */
async function verifyPassword(
  email: string,
  password: string,
): Promise<ActionResult> {
  if (!password) return actionFailed("비밀번호를 입력해 주세요.");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return actionFailed(
      error.message.toLowerCase().includes("invalid login credentials")
        ? "비밀번호가 일치하지 않아요."
        : describeAuthError(error),
    );
  }
  return { ok: true };
}

/**
 * Renames the signed-in account. The name is written to both the account
 * metadata and the profile row, because posts by other members are rendered
 * from the profile while the session reads the metadata copy.
 */
export async function updateNickname(nickname: string): Promise<AuthResult> {
  const trimmed = nickname.trim();

  if (!trimmed) return fail("닉네임을 입력해 주세요.");
  if (trimmed.length > NICKNAME_MAX_LENGTH) {
    return fail(`닉네임은 ${NICKNAME_MAX_LENGTH}자 이하로 입력해 주세요.`);
  }

  const { data: current } = await supabase.auth.getUser();
  if (!current.user) return fail("로그인이 필요해요.");
  if (nicknameOf(current.user) === trimmed) {
    return fail("지금 쓰고 있는 닉네임이에요.");
  }

  const { data, error } = await supabase.auth.updateUser({
    data: { nickname: trimmed, display_name: trimmed },
  });
  if (error) return fail(describeAuthError(error));
  if (!data.user) return fail("닉네임을 바꾸지 못했어요.");

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ display_name: trimmed })
    .eq("id", data.user.id);

  // The metadata is already updated, so the member sees the new name either
  // way; only other members' view of it lags until this succeeds.
  if (profileError) {
    console.error("[pulseroom] failed to update profile name", profileError);
  }

  return { ok: true, user: toSessionUser(data.user) };
}

export async function changePassword(input: {
  email: string;
  currentPassword: string;
  nextPassword: string;
}): Promise<ActionResult> {
  if (input.nextPassword.length < PASSWORD_MIN_LENGTH) {
    return actionFailed(
      `새 비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상 입력해 주세요.`,
    );
  }
  if (input.nextPassword === input.currentPassword) {
    return actionFailed("지금 쓰고 있는 비밀번호예요.");
  }

  const verified = await verifyPassword(input.email, input.currentPassword);
  if (!verified.ok) return verified;

  const { error } = await supabase.auth.updateUser({
    password: input.nextPassword,
  });
  if (error) return actionFailed(describeAuthError(error));

  // Keep "remember me" working for whoever saved this account's password.
  const remember = getRemember();
  if (
    remember.keepPassword &&
    normalizeEmail(remember.email) === normalizeEmail(input.email)
  ) {
    saveRemember({ ...remember, password: input.nextPassword });
  }

  return { ok: true };
}

/**
 * Removes the account. The database function does the deleting, because the
 * browser key may not touch auth.users; posts, comments, reactions and the
 * profile row go with it through their foreign keys.
 */
export async function deleteAccount(input: {
  email: string;
  password: string;
}): Promise<ActionResult> {
  const verified = await verifyPassword(input.email, input.password);
  if (!verified.ok) return verified;

  const { error } = await supabase.rpc("pulse_delete_account");
  if (error) {
    console.error("[pulseroom] failed to delete account", error);
    return actionFailed("탈퇴 처리에 실패했어요. 잠시 후 다시 시도해 주세요.");
  }

  await supabase.auth.signOut();

  const remember = getRemember();
  if (normalizeEmail(remember.email) === normalizeEmail(input.email)) {
    removeKey(REMEMBER_KEY);
  }

  return { ok: true };
}
