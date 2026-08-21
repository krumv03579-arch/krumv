/**
 * Shapes and helpers for what a member has written and reacted to.
 *
 * The rows themselves come from Supabase (see `api.ts`); this module only holds
 * the types the screens share and the small pure helpers used to merge the
 * database feed with the seeded demo content that still ships in the bundle.
 */

import { isDatabaseId, type StoredComment, type StoredReaction } from "./api";
import { postById, posts as seedPosts, type Post } from "./mock-data";

export type { StoredComment, StoredReaction };

export type Activity = {
  /** Posts this member wrote. */
  posts: Post[];
  comments: StoredComment[];
  likes: StoredReaction[];
  saves: StoredReaction[];
};

export const emptyActivity: Activity = {
  posts: [],
  comments: [],
  likes: [],
  saves: [],
};

/**
 * The feed as members see it: everything written through the app, then the
 * seeded posts the product still ships as demo content.
 */
export function feedPosts(databasePosts: Post[]): Post[] {
  const ids = new Set(databasePosts.map((post) => post.id));
  return [...databasePosts, ...seedPosts.filter((post) => !ids.has(post.id))];
}

/** Resolves a post id against the loaded feed first, then the seeded content. */
export function resolvePost(postId: string, feed: Post[]): Post | undefined {
  return feed.find((post) => post.id === postId) ?? postById[postId];
}

export function hasReacted(list: StoredReaction[], postId: string) {
  return list.some((item) => item.postId === postId);
}

/** Flips a reaction locally so the button responds before the write lands. */
export function toggle(
  list: StoredReaction[],
  postId: string,
): StoredReaction[] {
  return hasReacted(list, postId)
    ? list.filter((item) => item.postId !== postId)
    : [{ postId, createdAt: Date.now() }, ...list];
}

/**
 * What the like button should read. A post in the database already counts the
 * member's own like, while a seeded post carries a fixed number, so theirs is
 * added on top of it.
 */
export function displayLikes(post: Post, liked: boolean) {
  if (isDatabaseId(post.id)) return post.likes;
  return post.likes + (liked ? 1 : 0);
}
