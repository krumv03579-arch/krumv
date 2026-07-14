
CREATE TABLE public.home_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  href text NOT NULL DEFAULT '/market',
  alt text NOT NULL DEFAULT '딜렉스타 배너',
  is_external boolean NOT NULL DEFAULT false,
  start_at timestamptz NOT NULL DEFAULT now(),
  end_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

GRANT SELECT ON public.home_banners TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.home_banners TO authenticated;
GRANT ALL ON public.home_banners TO service_role;

ALTER TABLE public.home_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "home_banners public read active" ON public.home_banners
  FOR SELECT USING (is_active AND start_at <= now() AND end_at > now());

CREATE POLICY "home_banners admin read all" ON public.home_banners
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "home_banners admin insert" ON public.home_banners
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "home_banners admin update" ON public.home_banners
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "home_banners admin delete" ON public.home_banners
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_home_banners_updated_at
  BEFORE UPDATE ON public.home_banners
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
