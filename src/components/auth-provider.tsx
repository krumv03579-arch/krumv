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
  signIn as signInUser,
  signOut as signOutUser,
  signUp as signUpUser,
  toSessionUser,
  withProfileNickname,
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

  const value = useMemo(
    () => ({ user, ready, signIn, signUp, signOut }),
    [user, ready, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
