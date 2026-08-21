import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import {
  changePassword as changePasswordForUser,
  deleteAccount as deleteAccountForUser,
  signIn as signInUser,
  signOut as signOutUser,
  signUp as signUpUser,
  toSessionUser,
  updateNickname as updateNicknameForUser,
  withProfileNickname,
  type ActionResult,
  type AuthResult,
  type SessionUser,
} from "@/lib/auth";

type AuthContextValue = {
  user: SessionUser | null;
  /** False until Supabase has restored the stored session on the client. */
  ready: boolean;
  signIn: (input: { email: string; password: string }) => Promise<AuthResult>;
  signUp: (input: {
    email: string;
    password: string;
    nickname: string;
  }) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  /** Renames the signed-in account and refreshes the session in place. */
  updateNickname: (nickname: string) => Promise<AuthResult>;
  changePassword: (input: {
    currentPassword: string;
    nextPassword: string;
  }) => Promise<ActionResult>;
  /** Deletes the account and everything it owns, then signs out. */
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

  // Supabase keeps the session in localStorage, so it can only be restored
  // after mount — the server always renders the logged-out state. The listener
  // also covers token refreshes, sign-outs and other tabs.
  useEffect(() => {
    let active = true;

    async function apply(next: SessionUser | null) {
      if (!active) return;
      setUser(next);
      setReady(true);
      if (!next) return;

      const refined = await withProfileNickname(next);
      if (active)
        setUser((current) => (current?.id === next.id ? refined : current));
    }

    void supabase.auth
      .getSession()
      .then(({ data }) =>
        apply(data.session?.user ? toSessionUser(data.session.user) : null),
      )
      .catch(() => {
        if (active) setReady(true);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        void apply(session?.user ? toSessionUser(session.user) : null);
      },
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
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

  const signOut = useCallback(async () => {
    await signOutUser();
    setUser(null);
  }, []);

  const updateNickname = useCallback(
    async (nickname: string): Promise<AuthResult> => {
      if (!user) {
        return { ok: false, message: "로그인이 필요해요.", kind: "error" };
      }
      const result = await updateNicknameForUser(nickname);
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
      // Posts, comments and reactions go with the account through their
      // foreign keys, so there is no local history left to clear.
      if (result.ok) setUser(null);
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
