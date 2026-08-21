-- pulseroom backend schema: accounts, community posts, comments and reactions.
--
-- The tables are prefixed `pulse_` because this project's migration history
-- carries an unrelated marketplace schema (products / posts / comments) from an
-- earlier Lovable app. The prefix keeps pulseroom's data separate whether it is
-- applied to a fresh project or to one that already has those tables.
--
-- Every statement is written to be re-runnable, so applying the file twice is a
-- no-op.

-- ---------------------------------------------------------------- helpers ---

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- --------------------------------------------------------------- profiles ---
-- One row per account. `display_name` is the nickname shown on posts and
-- comments; the id matches auth.users so it can be joined by user id.

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT UPDATE (display_name) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles readable by everyone" ON public.profiles;
CREATE POLICY "profiles readable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "users update own profile" ON public.profiles;
CREATE POLICY "users update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- The signup form sends the nickname as user metadata; mirror it into profiles
-- so it is readable without touching auth.users.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base text;
BEGIN
  base := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'nickname', ''),
    NULLIF(NEW.raw_user_meta_data->>'display_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'name', ''),
    NULLIF(split_part(NEW.email, '@', 1), ''),
    'user_' || substr(NEW.id::text, 1, 6)
  );

  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, base)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Accounts that predate the trigger still need a profile.
INSERT INTO public.profiles (id, display_name)
SELECT u.id,
       COALESCE(
         NULLIF(u.raw_user_meta_data->>'nickname', ''),
         NULLIF(split_part(u.email, '@', 1), ''),
         'user_' || substr(u.id::text, 1, 6)
       )
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------- pulse_posts ---
-- A community post. `body` keeps the raw text; the app splits it on newlines
-- into paragraphs. `artist` is the artist key from src/lib/mock-data.ts and
-- `category` the Korean 말머리 label.

CREATE TABLE IF NOT EXISTS public.pulse_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist text NOT NULL,
  category text NOT NULL,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  body text NOT NULL DEFAULT '',
  image_url text,
  likes_count integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  views integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pulse_posts_created_at_idx
  ON public.pulse_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS pulse_posts_user_id_idx
  ON public.pulse_posts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS pulse_posts_artist_idx
  ON public.pulse_posts (artist, created_at DESC);

GRANT SELECT ON public.pulse_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.pulse_posts TO authenticated;
GRANT ALL ON public.pulse_posts TO service_role;

ALTER TABLE public.pulse_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pulse_posts readable by everyone" ON public.pulse_posts;
CREATE POLICY "pulse_posts readable by everyone"
  ON public.pulse_posts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "pulse_posts insert own" ON public.pulse_posts;
CREATE POLICY "pulse_posts insert own"
  ON public.pulse_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "pulse_posts update own" ON public.pulse_posts;
CREATE POLICY "pulse_posts update own"
  ON public.pulse_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "pulse_posts delete own" ON public.pulse_posts;
CREATE POLICY "pulse_posts delete own"
  ON public.pulse_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS pulse_posts_set_updated_at ON public.pulse_posts;
CREATE TRIGGER pulse_posts_set_updated_at
  BEFORE UPDATE ON public.pulse_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -------------------------------------------------------- pulse_comments ---
-- `post_id` is text, not a foreign key: the feed mixes rows from pulse_posts
-- (uuid ids) with the seeded demo posts that ship in the bundle (slug ids like
-- "afterglow-teaser"), and both have to be commentable. Rows belonging to a
-- real post are cleaned up by the trigger further down.

CREATE TABLE IF NOT EXISTS public.pulse_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pulse_comments_post_id_idx
  ON public.pulse_comments (post_id, created_at);
CREATE INDEX IF NOT EXISTS pulse_comments_user_id_idx
  ON public.pulse_comments (user_id, created_at DESC);

GRANT SELECT ON public.pulse_comments TO anon, authenticated;
GRANT INSERT, DELETE ON public.pulse_comments TO authenticated;
GRANT ALL ON public.pulse_comments TO service_role;

ALTER TABLE public.pulse_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pulse_comments readable by everyone" ON public.pulse_comments;
CREATE POLICY "pulse_comments readable by everyone"
  ON public.pulse_comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "pulse_comments insert own" ON public.pulse_comments;
CREATE POLICY "pulse_comments insert own"
  ON public.pulse_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "pulse_comments delete own" ON public.pulse_comments;
CREATE POLICY "pulse_comments delete own"
  ON public.pulse_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------- pulse_reactions ---
-- Likes and saves share one table; `kind` says which. `post_id` is text for the
-- same reason as pulse_comments.

CREATE TABLE IF NOT EXISTS public.pulse_reactions (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('like', 'save')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id, kind)
);

CREATE INDEX IF NOT EXISTS pulse_reactions_post_id_idx
  ON public.pulse_reactions (post_id, kind);

GRANT SELECT ON public.pulse_reactions TO anon, authenticated;
GRANT INSERT, DELETE ON public.pulse_reactions TO authenticated;
GRANT ALL ON public.pulse_reactions TO service_role;

ALTER TABLE public.pulse_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pulse_reactions readable by everyone" ON public.pulse_reactions;
CREATE POLICY "pulse_reactions readable by everyone"
  ON public.pulse_reactions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "pulse_reactions insert own" ON public.pulse_reactions;
CREATE POLICY "pulse_reactions insert own"
  ON public.pulse_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "pulse_reactions delete own" ON public.pulse_reactions;
CREATE POLICY "pulse_reactions delete own"
  ON public.pulse_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------- derived counters ---
-- Both triggers match on `id::text` rather than casting post_id to uuid: a
-- reaction or comment on a seeded post carries a slug that is not a uuid, and
-- the cast would raise instead of simply matching nothing.

CREATE OR REPLACE FUNCTION public.pulse_sync_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.kind = 'like' THEN
    UPDATE public.pulse_posts
       SET likes_count = likes_count + 1
     WHERE id::text = NEW.post_id;
  ELSIF TG_OP = 'DELETE' AND OLD.kind = 'like' THEN
    UPDATE public.pulse_posts
       SET likes_count = GREATEST(likes_count - 1, 0)
     WHERE id::text = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS pulse_reactions_likes_count ON public.pulse_reactions;
CREATE TRIGGER pulse_reactions_likes_count
  AFTER INSERT OR DELETE ON public.pulse_reactions
  FOR EACH ROW EXECUTE FUNCTION public.pulse_sync_likes_count();

CREATE OR REPLACE FUNCTION public.pulse_sync_comments_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.pulse_posts
       SET comments_count = comments_count + 1
     WHERE id::text = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.pulse_posts
       SET comments_count = GREATEST(comments_count - 1, 0)
     WHERE id::text = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS pulse_comments_comments_count ON public.pulse_comments;
CREATE TRIGGER pulse_comments_comments_count
  AFTER INSERT OR DELETE ON public.pulse_comments
  FOR EACH ROW EXECUTE FUNCTION public.pulse_sync_comments_count();

-- pulse_comments and pulse_reactions cannot carry a foreign key to pulse_posts
-- (their post_id is text), so deleting a post takes its children down by hand.
CREATE OR REPLACE FUNCTION public.pulse_cleanup_post_children()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.pulse_comments WHERE post_id = OLD.id::text;
  DELETE FROM public.pulse_reactions WHERE post_id = OLD.id::text;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS pulse_posts_cleanup_children ON public.pulse_posts;
CREATE TRIGGER pulse_posts_cleanup_children
  AFTER DELETE ON public.pulse_posts
  FOR EACH ROW EXECUTE FUNCTION public.pulse_cleanup_post_children();

-- ------------------------------------------------------------ view counter ---
-- Reading a post bumps its counter. `security definer` because row level
-- security only lets an author write to their own row, and a view is recorded
-- by whoever is reading — signed in or not.

CREATE OR REPLACE FUNCTION public.pulse_increment_views(_post_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.pulse_posts SET views = views + 1 WHERE id = _post_id;
$$;

GRANT EXECUTE ON FUNCTION public.pulse_increment_views(uuid) TO anon, authenticated;

-- --------------------------------------------------------------- realtime ---
-- Lets the feed and the post page pick up other members' writing live.

ALTER TABLE public.pulse_posts REPLICA IDENTITY FULL;
ALTER TABLE public.pulse_comments REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public' AND tablename = 'pulse_posts'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.pulse_posts;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public' AND tablename = 'pulse_comments'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.pulse_comments;
    END IF;
  END IF;
EXCEPTION
  -- Realtime is a convenience here, not a requirement: a role that may not
  -- touch the publication should not fail the whole migration.
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'skipping realtime publication: insufficient privilege';
END
$$;
