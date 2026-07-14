
CREATE TABLE public.quick_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sort_order INT NOT NULL,
  image_url TEXT,
  label TEXT NOT NULL,
  link_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX quick_links_sort_order_key ON public.quick_links(sort_order);

GRANT SELECT ON public.quick_links TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.quick_links TO authenticated;
GRANT ALL ON public.quick_links TO service_role;

ALTER TABLE public.quick_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quick_links_public_read_active"
  ON public.quick_links FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "quick_links_admin_read_all"
  ON public.quick_links FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "quick_links_admin_insert"
  ON public.quick_links FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "quick_links_admin_update"
  ON public.quick_links FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "quick_links_admin_delete"
  ON public.quick_links FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER quick_links_set_updated_at
  BEFORE UPDATE ON public.quick_links
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.quick_links (sort_order, label, link_url, is_active) VALUES
  (1, '마켓',     '/market',    true),
  (2, '커뮤니티', '/community', true),
  (3, '스토어',   '/store',     true),
  (4, '구단',     '/clubs',     true),
  (5, '일정',     '/schedule',  true),
  (6, '시세',     '/prices',    true);
