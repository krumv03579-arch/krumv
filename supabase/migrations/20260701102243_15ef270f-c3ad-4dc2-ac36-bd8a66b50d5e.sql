
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT UPDATE (display_name) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles readable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  base text;
BEGIN
  base := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'display_name',''),
    NULLIF(NEW.raw_user_meta_data->>'name',''),
    NULLIF(NEW.raw_user_meta_data->>'nickname',''),
    split_part(NEW.email, '@', 1),
    'user_' || substr(NEW.id::text, 1, 6)
  );
  INSERT INTO public.profiles (id, display_name) VALUES (NEW.id, base)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing users
INSERT INTO public.profiles (id, display_name)
SELECT u.id, COALESCE(
  NULLIF(u.raw_user_meta_data->>'display_name',''),
  NULLIF(u.raw_user_meta_data->>'name',''),
  NULLIF(u.raw_user_meta_data->>'nickname',''),
  split_part(u.email, '@', 1),
  'user_' || substr(u.id::text, 1, 6)
)
FROM auth.users u
ON CONFLICT (id) DO NOTHING;
