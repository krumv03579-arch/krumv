/**
 * Browser-local account store.
 *
 * The backend is not connected yet, so accounts, the current session and the
 * "remember me" values all live in this browser's localStorage. Account
 * passwords are stored as a salted SHA-256 hash; the optional saved password
 * for the login form is the one value kept in readable form, because the form
 * has to be able to fill it back in.
 */

import { readJson, removeKey, writeJson } from "./browser-store";

const USERS_KEY = "pulseroom:users:v1";
const SESSION_KEY = "pulseroom:session:v1";
const REMEMBER_KEY = "pulseroom:remember:v1";

export const PASSWORD_MIN_LENGTH = 6;
export const NICKNAME_MAX_LENGTH = 12;

export type StoredUser = {
  email: string;
  nickname: string;
  salt: string;
  passwordHash: string;
  createdAt: string;
};

export type SessionUser = {
  email: string;
  nickname: string;
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

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

function randomSalt() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

export function listUsers(): StoredUser[] {
  return readJson<StoredUser[]>(USERS_KEY, []);
}

export function findUser(email: string) {
  const target = normalizeEmail(email);
  return listUsers().find((user) => user.email === target);
}

export type AuthResult =
  { ok: true; user: SessionUser } | { ok: false; message: string };

export async function signUp(input: {
  email: string;
  password: string;
  nickname: string;
}): Promise<AuthResult> {
  const email = normalizeEmail(input.email);
  const nickname = input.nickname.trim();

  if (!isValidEmail(email))
    return { ok: false, message: "이메일 형식을 확인해 주세요." };
  if (input.password.length < PASSWORD_MIN_LENGTH) {
    return {
      ok: false,
      message: `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상 입력해 주세요.`,
    };
  }
  if (!nickname) return { ok: false, message: "닉네임을 입력해 주세요." };
  if (nickname.length > NICKNAME_MAX_LENGTH) {
    return {
      ok: false,
      message: `닉네임은 ${NICKNAME_MAX_LENGTH}자 이하로 입력해 주세요.`,
    };
  }
  if (findUser(email))
    return { ok: false, message: "이미 가입된 이메일이에요." };

  const salt = randomSalt();
  const user: StoredUser = {
    email,
    nickname,
    salt,
    passwordHash: await hashPassword(input.password, salt),
    createdAt: new Date().toISOString(),
  };
  writeJson(USERS_KEY, [...listUsers(), user]);

  const session = { email, nickname };
  writeJson(SESSION_KEY, session);
  return { ok: true, user: session };
}

export async function signIn(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const user = findUser(input.email);
  if (!user) return { ok: false, message: "가입되지 않은 이메일이에요." };

  const hash = await hashPassword(input.password, user.salt);
  if (hash !== user.passwordHash)
    return { ok: false, message: "비밀번호가 일치하지 않아요." };

  const session = { email: user.email, nickname: user.nickname };
  writeJson(SESSION_KEY, session);
  return { ok: true, user: session };
}

export function getSession(): SessionUser | null {
  return readJson<SessionUser | null>(SESSION_KEY, null);
}

export function clearSession() {
  removeKey(SESSION_KEY);
}

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
