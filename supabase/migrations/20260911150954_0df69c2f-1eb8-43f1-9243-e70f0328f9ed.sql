GRANT SELECT, INSERT, UPDATE, DELETE ON public.tracking_secrets TO authenticated;
GRANT ALL ON public.tracking_secrets TO service_role;

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