
CREATE TABLE public.community_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  href text NOT NULL DEFAULT '/community',
  alt text NOT NULL DEFAULT '레사모 커뮤니티 배너',
  is_external boolean NOT NULL DEFAULT false,
  start_at timestamptz NOT NULL DEFAULT now(),
  end_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT community_banners_period_valid CHECK (end_at > start_at)
);

CREATE INDEX community_banners_window_idx
  ON public.community_banners (is_active, start_at, end_at);

GRANT SELECT ON public.community_banners TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.community_banners TO authenticated;
GRANT ALL ON public.community_banners TO service_role;

ALTER TABLE public.community_banners ENABLE ROW LEVEL SECURITY;

-- Public: only currently-scheduled & active banners are visible
CREATE POLICY "community_banners public read active"
  ON public.community_banners FOR SELECT
  TO anon, authenticated
  USING (is_active AND start_at <= now() AND end_at > now());

-- Admins: full access (including listing inactive / scheduled / expired)
CREATE POLICY "community_banners admin read all"
  ON public.community_banners FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "community_banners admin insert"
  ON public.community_banners FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "community_banners admin update"
  ON public.community_banners FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "community_banners admin delete"
  ON public.community_banners FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER community_banners_set_updated_at
  BEFORE UPDATE ON public.community_banners
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
