/**
 * Supabase data access for the community feed.
 *
 * Everything here returns the same `Post` / `Comment` shapes the screens
 * already render, so the UI does not have to know whether a row came from the
 * database or from the seeded demo content in `mock-data.ts`.
 *
 * Post ids are therefore mixed on purpose: rows from `pulse_posts` carry a
 * uuid, the seeded posts carry a slug. Comments and reactions store the id as
 * text so both kinds can be commented on and liked.
 */

import { supabase } from "@/integrations/supabase/client";

import { relativeTime } from "./format";
import {
  artistByKey,
  artists,
  postCategories,
  type ArtistKey,
  type Comment,
  type Post,
  type PostCategory,
} from "./mock-data";

export type ReactionKind = "like" | "save";

export type StoredComment = {
  id: string;
  postId: string;
  body: string;
  createdAt: number;
};

export type StoredReaction = {
  postId: string;
  createdAt: number;
};

type PostRow = {
  id: string;
  user_id: string;
  artist: string;
  category: string;
  title: string;
  body: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  views: number;
  created_at: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Seeded posts are addressed by slug, so only uuids can be looked up in the database. */
export function isDatabaseId(postId: string) {
  return UUID.test(postId);
}

const artistKeys = new Set<string>(artists.map((item) => item.key));
const categories = new Set<string>(postCategories);

function asArtist(value: string): ArtistKey {
  return artistKeys.has(value) ? (value as ArtistKey) : artists[0].key;
}

function asCategory(value: string): PostCategory {
  return categories.has(value) ? (value as PostCategory) : "자유";
}

function paragraphs(body: string) {
  return body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const FALLBACK_BODY = "내용이 없는 글이에요.";
const FALLBACK_AUTHOR = "익명의 팬";

function toPost(row: PostRow, author: string): Post {
  const artist = asArtist(row.artist);
  const lines = paragraphs(row.body);
  const createdAt = new Date(row.created_at).getTime();

  return {
    id: row.id,
    artist,
    category: asCategory(row.category),
    title: row.title,
    excerpt: lines[0] ?? FALLBACK_BODY,
    body: lines.length > 0 ? lines : [FALLBACK_BODY],
    author,
    authorTag: artistByKey[artist].fandom,
    createdLabel: relativeTime(createdAt),
    // The feed sorts on this, so it has to grow with age like the seeded values.
    createdMinutes: Math.max(0, Math.round((Date.now() - createdAt) / 60000)),
    likes: row.likes_count,
    comments: row.comments_count,
    views: row.views,
    // No separate "화제" metric in the database — derive one from the activity
    // the post actually collected.
    talking: row.likes_count * 2 + row.comments_count * 3,
    image: row.image_url ?? undefined,
  };
}

/** Nicknames live in `profiles`; posts and comments only carry the author's id. */
async function displayNames(userIds: string[]) {
  const unique = [...new Set(userIds)];
  if (unique.length === 0) return new Map<string, string>();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", unique);

  if (error) throw error;
  return new Map((data ?? []).map((row) => [row.id, row.display_name]));
}

async function withAuthors(rows: PostRow[]): Promise<Post[]> {
  if (rows.length === 0) return [];
  const names = await displayNames(rows.map((row) => row.user_id));
  return rows.map((row) =>
    toPost(row, names.get(row.user_id) ?? FALLBACK_AUTHOR),
  );
}

const POST_COLUMNS =
  "id, user_id, artist, category, title, body, image_url, likes_count, comments_count, views, created_at";

/** Every post in the community feed, newest first. */
export async function listPosts(limit = 200): Promise<Post[]> {
  const { data, error } = await supabase
    .from("pulse_posts")
    .select(POST_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return withAuthors((data ?? []) as PostRow[]);
}

/** The posts one member wrote, newest first. */
export async function listPostsByAuthor(userId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from("pulse_posts")
    .select(POST_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return withAuthors((data ?? []) as PostRow[]);
}

export async function getPost(postId: string): Promise<Post | null> {
  if (!isDatabaseId(postId)) return null;

  const { data, error } = await supabase
    .from("pulse_posts")
    .select(POST_COLUMNS)
    .eq("id", postId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const [post] = await withAuthors([data as PostRow]);
  return post ?? null;
}

export async function createPost(input: {
  userId: string;
  artist: ArtistKey;
  category: PostCategory;
  title: string;
  body: string;
}): Promise<Post> {
  const { data, error } = await supabase
    .from("pulse_posts")
    .insert({
      user_id: input.userId,
      artist: input.artist,
      category: input.category,
      title: input.title,
      body: input.body,
    })
    .select(POST_COLUMNS)
    .single();

  if (error) throw error;

  const [post] = await withAuthors([data as PostRow]);
  return post;
}

/**
 * Counts one read of a post. The database function is `security definer`
 * because row level security only lets an author update their own row.
 */
export async function countView(postId: string) {
  if (!isDatabaseId(postId)) return;
  const { error } = await supabase.rpc("pulse_increment_views", {
    _post_id: postId,
  });
  if (error) throw error;
}

/** The comment thread of a post, oldest first. */
export async function listComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("pulse_comments")
    .select("id, post_id, user_id, body, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const rows = data ?? [];
  const names = await displayNames(rows.map((row) => row.user_id));

  return rows.map((row) => ({
    id: row.id,
    author: names.get(row.user_id) ?? FALLBACK_AUTHOR,
    authorTag: "팬룸 멤버",
    createdLabel: relativeTime(new Date(row.created_at).getTime()),
    body: row.body,
    likes: 0,
  }));
}

/** The comments one member left, newest first — used by the my-page tab. */
export async function listCommentsByAuthor(
  userId: string,
): Promise<StoredComment[]> {
  const { data, error } = await supabase
    .from("pulse_comments")
    .select("id, post_id, body, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    postId: row.post_id,
    body: row.body,
    createdAt: new Date(row.created_at).getTime(),
  }));
}

export async function createComment(input: {
  userId: string;
  postId: string;
  body: string;
}): Promise<StoredComment> {
  const { data, error } = await supabase
    .from("pulse_comments")
    .insert({
      user_id: input.userId,
      post_id: input.postId,
      body: input.body,
    })
    .select("id, post_id, body, created_at")
    .single();

  if (error) throw error;

  return {
    id: data.id,
    postId: data.post_id,
    body: data.body,
    createdAt: new Date(data.created_at).getTime(),
  };
}

/** Every like and save the member has left, split by kind. */
export async function listReactions(userId: string): Promise<{
  likes: StoredReaction[];
  saves: StoredReaction[];
}> {
  const { data, error } = await supabase
    .from("pulse_reactions")
    .select("post_id, kind, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = data ?? [];
  const pick = (kind: ReactionKind) =>
    rows
      .filter((row) => row.kind === kind)
      .map((row) => ({
        postId: row.post_id,
        createdAt: new Date(row.created_at).getTime(),
      }));

  return { likes: pick("like"), saves: pick("save") };
}

export async function setReaction(input: {
  userId: string;
  postId: string;
  kind: ReactionKind;
  on: boolean;
}) {
  const match = {
    user_id: input.userId,
    post_id: input.postId,
    kind: input.kind,
  };

  // A double tap must not fail on the primary key, so an existing row is left
  // as it is rather than reported as a conflict.
  const { error } = input.on
    ? await supabase.from("pulse_reactions").upsert(match, {
        onConflict: "user_id,post_id,kind",
        ignoreDuplicates: true,
      })
    : await supabase.from("pulse_reactions").delete().match(match);

  if (error) throw error;
}
