CREATE TABLE public.showcase_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  video_url text NOT NULL,
  thumbnail_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.showcase_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.showcase_videos TO authenticated;
GRANT ALL ON public.showcase_videos TO service_role;

ALTER TABLE public.showcase_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "videos public read" ON public.showcase_videos
  FOR SELECT USING (is_active OR public.is_admin());
CREATE POLICY "videos admin write" ON public.showcase_videos
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TRIGGER videos_touch BEFORE UPDATE ON public.showcase_videos
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DO $$
DECLARE trending_order integer;
BEGIN
  IF EXISTS (SELECT 1 FROM public.homepage_sections WHERE section_key = 'videos') THEN
    RETURN;
  END IF;
  SELECT sort_order INTO trending_order FROM public.homepage_sections
    WHERE section_key = 'trending' OR section_key LIKE 'trending%' ORDER BY sort_order LIMIT 1;
  IF trending_order IS NULL THEN
    SELECT COALESCE(max(sort_order), 0) INTO trending_order FROM public.homepage_sections;
  END IF;
  UPDATE public.homepage_sections SET sort_order = sort_order + 1 WHERE sort_order > trending_order;
  INSERT INTO public.homepage_sections (section_key, title, subtitle, is_visible, sort_order, product_limit, config)
  VALUES ('videos', 'ভিডিও কালেকশন', 'আমাদের সর্বশেষ রিলস ও শর্টস দেখুন', true, trending_order + 1, 8, '{}'::jsonb);
END $$;