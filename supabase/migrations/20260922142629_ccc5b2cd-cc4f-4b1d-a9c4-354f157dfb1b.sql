ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS "reviews admin insert" ON public.reviews;
CREATE POLICY "reviews admin insert" ON public.reviews FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "review media public insert" ON storage.objects;
CREATE POLICY "review media public insert" ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'store-media' AND (storage.foldername(name))[1] = 'reviews');

INSERT INTO public.homepage_sections (section_key, title, subtitle, is_visible, sort_order, product_limit, config)
SELECT 'reviews', 'ক্রেতাদের রিভিউ', 'আমাদের ক্রেতাদের অভিজ্ঞতা', true,
  COALESCE((SELECT max(sort_order) FROM public.homepage_sections), 0) + 1, 8, '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.homepage_sections WHERE section_key = 'reviews');