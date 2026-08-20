import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import {
  clearSession,
  getSession,
  signIn as signInUser,
  signUp as signUpUser,
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

  const value = useMemo(
    () => ({ user, ready, signIn, signUp, signOut }),
    [user, ready, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
