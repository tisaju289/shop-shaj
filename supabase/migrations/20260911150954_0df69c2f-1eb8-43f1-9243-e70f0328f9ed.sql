CREATE TABLE public.tracking_secrets (
  id text PRIMARY KEY DEFAULT 'default',
  fb_access_token text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tracking_secrets TO authenticated;
GRANT ALL ON public.tracking_secrets TO service_role;
ALTER TABLE public.tracking_secrets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tracking secrets admin only" ON public.tracking_secrets
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE TRIGGER tracking_secrets_touch BEFORE UPDATE ON public.tracking_secrets
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider text NOT NULL,
  event_name text NOT NULL,
  event_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  provider_response text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, event_id)
);
GRANT ALL ON public.tracking_events TO service_role;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER tracking_events_touch BEFORE UPDATE ON public.tracking_events FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();