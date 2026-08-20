import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import { useAuth } from "@/components/auth-provider";
import {
  emptyActivity,
  readActivity,
  toggle,
  writeActivity,
  type Activity,
  type MyComment,
} from "@/lib/activity";
import type { Post } from "@/lib/mock-data";

type ActivityContextValue = {
  activity: Activity;
  /** True once the stored activity has been read on the client. */
  ready: boolean;
  addPost: (post: Post) => void;
  addComment: (comment: Omit<MyComment, "createdAt">) => void;
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  isLiked: (postId: string) => boolean;
  isSaved: (postId: string) => boolean;
};

const ActivityContext = createContext<ActivityContextValue | null>(null);

export function useActivity() {
  const value = useContext(ActivityContext);
  if (!value)
    throw new Error("useActivity must be used inside <ActivityProvider>");
  return value;
}

export function ActivityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activity, setActivity] = useState<Activity>(emptyActivity);
  const [ready, setReady] = useState(false);

  // Activity is per account and lives in the browser, so it can only be read
  // after mount — and it resets when the session changes.
  useEffect(() => {
    setActivity(user ? readActivity(user.email) : emptyActivity);
    setReady(true);
  }, [user]);

  const update = useCallback(
    (change: (previous: Activity) => Activity) => {
      setActivity((previous) => {
        const next = change(previous);
        if (user) writeActivity(user.email, next);
        return next;
      });
    },
    [user],
  );

  const value = useMemo<ActivityContextValue>(
    () => ({
      activity,
      ready,
      addPost: (post) =>
        update((prev) => ({ ...prev, posts: [post, ...prev.posts] })),
      addComment: (comment) =>
        update((prev) => ({
          ...prev,
          comments: [{ ...comment, createdAt: Date.now() }, ...prev.comments],
        })),
      toggleLike: (postId) =>
        update((prev) => ({ ...prev, likes: toggle(prev.likes, postId) })),
      toggleSave: (postId) =>
        update((prev) => ({ ...prev, saves: toggle(prev.saves, postId) })),
      isLiked: (postId) =>
        activity.likes.some((item) => item.postId === postId),
      isSaved: (postId) =>
        activity.saves.some((item) => item.postId === postId),
    }),
    [activity, ready, update],
  );

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
}
