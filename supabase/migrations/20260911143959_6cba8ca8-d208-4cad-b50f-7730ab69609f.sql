CREATE TABLE IF NOT EXISTS public.tracking_secrets (
  id TEXT PRIMARY KEY DEFAULT 'default',
  fb_access_token TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.tracking_secrets TO authenticated;
GRANT ALL ON public.tracking_secrets TO service_role;

ALTER TABLE public.tracking_secrets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage tracking secrets" ON public.tracking_secrets;
CREATE POLICY "Admins manage tracking secrets" ON public.tracking_secrets
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

INSERT INTO public.tracking_secrets (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;