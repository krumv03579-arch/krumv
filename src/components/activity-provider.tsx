import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import {
  createComment,
  createPost,
  listCommentsByAuthor,
  listPosts,
  listPostsByAuthor,
  listReactions,
  setReaction,
  type ReactionKind,
} from "@/lib/api";
import {
  emptyActivity,
  feedPosts,
  hasReacted,
  toggle,
  type Activity,
} from "@/lib/activity";
import type { ArtistKey, Post, PostCategory } from "@/lib/mock-data";

type ActivityContextValue = {
  /** The whole feed: posts from the database, then the seeded demo content. */
  posts: Post[];
  /** What the signed-in member wrote and reacted to. */
  activity: Activity;
  /** True once the first load has settled, successfully or not. */
  ready: boolean;
  /** Set when the database could not be read — the feed falls back to seed data. */
  error: string | null;
  refresh: () => Promise<void>;
  addPost: (input: {
    artist: ArtistKey;
    category: PostCategory;
    title: string;
    body: string;
  }) => Promise<Post | null>;
  addComment: (input: { postId: string; body: string }) => Promise<boolean>;
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

const LOAD_FAILED =
  "커뮤니티 글을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.";

export function ActivityProvider({ children }: { children: ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const [databasePosts, setDatabasePosts] = useState<Post[]>([]);
  const [activity, setActivity] = useState<Activity>(emptyActivity);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guards the state updates of a load that a newer one has already replaced.
  const loadId = useRef(0);

  const load = useCallback(async () => {
    const id = ++loadId.current;
    const userId = user?.id;

    try {
      const [posts, mine] = await Promise.all([
        listPosts(),
        userId
          ? Promise.all([
              listPostsByAuthor(userId),
              listCommentsByAuthor(userId),
              listReactions(userId),
            ])
          : null,
      ]);

      if (id !== loadId.current) return;

      setDatabasePosts(posts);
      setActivity(
        mine
          ? {
              posts: mine[0],
              comments: mine[1],
              likes: mine[2].likes,
              saves: mine[2].saves,
            }
          : emptyActivity,
      );
      setError(null);
    } catch (cause) {
      if (id !== loadId.current) return;
      console.error("[pulseroom] failed to load community data", cause);
      setDatabasePosts([]);
      setActivity(emptyActivity);
      setError(LOAD_FAILED);
    } finally {
      if (id === loadId.current) setReady(true);
    }
  }, [user?.id]);

  // Reload whenever the session changes: reactions and the my-page tabs are
  // per account. The server render stays on the seeded feed.
  useEffect(() => {
    if (!authReady) return;
    void load();
  }, [authReady, load]);

  const posts = useMemo(() => feedPosts(databasePosts), [databasePosts]);

  const addPost = useCallback<ActivityContextValue["addPost"]>(
    async (input) => {
      if (!user) {
        toast.error("글쓰기는 로그인 후 이용할 수 있어요.");
        return null;
      }

      try {
        const post = await createPost({ userId: user.id, ...input });
        setDatabasePosts((previous) => [post, ...previous]);
        setActivity((previous) => ({
          ...previous,
          posts: [post, ...previous.posts],
        }));
        return post;
      } catch (cause) {
        console.error("[pulseroom] failed to publish post", cause);
        toast.error("글을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
        return null;
      }
    },
    [user],
  );

  const addComment = useCallback<ActivityContextValue["addComment"]>(
    async (input) => {
      if (!user) {
        toast.error("댓글은 로그인 후 남길 수 있어요.");
        return false;
      }

      try {
        const comment = await createComment({ userId: user.id, ...input });
        setActivity((previous) => ({
          ...previous,
          comments: [comment, ...previous.comments],
        }));
        setDatabasePosts((previous) =>
          previous.map((post) =>
            post.id === input.postId
              ? { ...post, comments: post.comments + 1 }
              : post,
          ),
        );
        return true;
      } catch (cause) {
        console.error("[pulseroom] failed to publish comment", cause);
        toast.error("댓글을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
        return false;
      }
    },
    [user],
  );

  /**
   * Flips the reaction on screen first and writes it behind that, putting the
   * old value back if the write is refused.
   */
  const react = useCallback(
    (kind: ReactionKind, postId: string) => {
      if (!user) {
        toast.error("로그인하면 좋아요와 저장을 사용할 수 있어요.");
        return;
      }

      const field = kind === "like" ? "likes" : "saves";
      const on = !hasReacted(activity[field], postId);

      setActivity((previous) => ({
        ...previous,
        [field]: toggle(previous[field], postId),
      }));
      if (kind === "like") {
        setDatabasePosts((previous) =>
          previous.map((post) =>
            post.id === postId
              ? { ...post, likes: Math.max(0, post.likes + (on ? 1 : -1)) }
              : post,
          ),
        );
      }

      void setReaction({ userId: user.id, postId, kind, on }).catch((cause) => {
        console.error("[pulseroom] failed to save reaction", cause);
        setActivity((previous) => ({
          ...previous,
          [field]: toggle(previous[field], postId),
        }));
        if (kind === "like") {
          setDatabasePosts((previous) =>
            previous.map((post) =>
              post.id === postId
                ? { ...post, likes: Math.max(0, post.likes + (on ? -1 : 1)) }
                : post,
            ),
          );
        }
        toast.error("반응을 저장하지 못했어요.");
      });
    },
    [activity, user],
  );

  const value = useMemo<ActivityContextValue>(
    () => ({
      posts,
      activity,
      ready,
      error,
      refresh: load,
      addPost,
      addComment,
      toggleLike: (postId) => react("like", postId),
      toggleSave: (postId) => react("save", postId),
      isLiked: (postId) => hasReacted(activity.likes, postId),
      isSaved: (postId) => hasReacted(activity.saves, postId),
    }),
    [posts, activity, ready, error, load, addPost, addComment, react],
  );

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
}
