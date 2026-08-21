import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import { clearActivity } from "@/lib/activity";
import {
  changePassword as changePasswordForUser,
  clearSession,
  deleteAccount as deleteAccountForUser,
  getSession,
  signIn as signInUser,
  signUp as signUpUser,
  updateNickname as updateNicknameForUser,
  type ActionResult,
  type AuthResult,
  type SessionUser,
} from "@/lib/auth";

type AuthContextValue = {
  user: SessionUser | null;
  /** False until the stored session has been read on the client. */
  ready: boolean;
  signIn: (input: { email: string; password: string }) => Promise<AuthResult>;
  signUp: (input: {
    email: string;
    password: string;
    nickname: string;
  }) => Promise<AuthResult>;
  signOut: () => void;
  /** Renames the signed-in account and refreshes the session in place. */
  updateNickname: (nickname: string) => AuthResult;
  changePassword: (input: {
    currentPassword: string;
    nextPassword: string;
  }) => Promise<ActionResult>;
  /** Deletes the account together with its stored activity, then signs out. */
  deleteAccount: (input: { password: string }) => Promise<ActionResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  // The session lives in localStorage, so it can only be read after mount —
  // the server always renders the logged-out state.
  useEffect(() => {
    setUser(getSession());
    setReady(true);

    function sync(event: StorageEvent) {
      if (event.key === "pulseroom:session:v1") setUser(getSession());
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const signIn = useCallback(
    async (input: { email: string; password: string }) => {
      const result = await signInUser(input);
      if (result.ok) setUser(result.user);
      return result;
    },
    [],
  );

  const signUp = useCallback(
    async (input: { email: string; password: string; nickname: string }) => {
      const result = await signUpUser(input);
      if (result.ok) setUser(result.user);
      return result;
    },
    [],
  );

  const signOut = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const updateNickname = useCallback(
    (nickname: string): AuthResult => {
      if (!user) return { ok: false, message: "로그인이 필요해요." };
      const result = updateNicknameForUser(user.email, nickname);
      if (result.ok) setUser(result.user);
      return result;
    },
    [user],
  );

  const changePassword = useCallback(
    async (input: { currentPassword: string; nextPassword: string }) => {
      if (!user) return { ok: false as const, message: "로그인이 필요해요." };
      return changePasswordForUser({ email: user.email, ...input });
    },
    [user],
  );

  const deleteAccount = useCallback(
    async (input: { password: string }) => {
      if (!user) return { ok: false as const, message: "로그인이 필요해요." };
      const result = await deleteAccountForUser({
        email: user.email,
        password: input.password,
      });
      if (result.ok) {
        clearActivity(user.email);
        setUser(null);
      }
      return result;
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      ready,
      signIn,
      signUp,
      signOut,
      updateNickname,
      changePassword,
      deleteAccount,
    }),
    [
      user,
      ready,
      signIn,
      signUp,
      signOut,
      updateNickname,
      changePassword,
      deleteAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
