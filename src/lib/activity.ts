/**
 * Per-account activity log: what the signed-in member wrote, commented on,
 * liked and saved.
 *
 * Stored per email in the browser (see browser-store) so the my-page history
 * survives navigation and reloads while there is no backend. Posts are kept as
 * whole `Post` objects so a member's own writing is browsable exactly like the
 * seeded content.
 */

import { readJson, writeJson } from "./browser-store";
import { postById, posts as seedPosts, type Post } from "./mock-data";

export type MyComment = {
  id: string;
  postId: string;
  body: string;
  createdAt: number;
};

export type MyReaction = {
  postId: string;
  createdAt: number;
};

export type Activity = {
  posts: Post[];
  comments: MyComment[];
  likes: MyReaction[];
  saves: MyReaction[];
};

export const emptyActivity: Activity = {
  posts: [],
  comments: [],
  likes: [],
  saves: [],
};

function key(email: string) {
  return `pulseroom:activity:v1:${email}`;
}

export function readActivity(email: string): Activity {
  return { ...emptyActivity, ...readJson<Partial<Activity>>(key(email), {}) };
}

export function writeActivity(email: string, activity: Activity) {
  writeJson(key(email), activity);
}

/** Resolves a post id against the seeded feed first, then the member's own posts. */
export function resolvePost(
  postId: string,
  activity: Activity,
): Post | undefined {
  return postById[postId] ?? activity.posts.find((post) => post.id === postId);
}

/** The feed as the member sees it: their own posts first, then the seeded ones. */
export function feedPosts(activity: Activity): Post[] {
  return [...activity.posts, ...seedPosts];
}

export function toggle(list: MyReaction[], postId: string): MyReaction[] {
  return list.some((item) => item.postId === postId)
    ? list.filter((item) => item.postId !== postId)
    : [{ postId, createdAt: Date.now() }, ...list];
}
