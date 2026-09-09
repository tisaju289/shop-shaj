-- Admins can manage roles
CREATE POLICY "roles admin read" ON public.user_roles FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "roles admin insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "roles admin update" ON public.user_roles FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "roles admin delete" ON public.user_roles FOR DELETE TO authenticated USING (public.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- Bootstrap: the first signed-in user can claim ownership when no admin exists yet
CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin') ON CONFLICT DO NOTHING;
  RETURN true;
END; $$;

REVOKE ALL ON FUNCTION public.claim_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;

-- Admin dashboard needs to read profiles of customers
CREATE OR REPLACE FUNCTION public.admin_dashboard_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE WHEN NOT public.is_admin() THEN '{}'::jsonb ELSE jsonb_build_object(
    'orders_total', (SELECT count(*) FROM public.orders),
    'orders_new', (SELECT count(*) FROM public.orders WHERE status = 'new'),
    'orders_today', (SELECT count(*) FROM public.orders WHERE created_at >= date_trunc('day', now())),
    'revenue_total', (SELECT COALESCE(sum(total),0) FROM public.orders WHERE status NOT IN ('cancelled','returned')),
    'revenue_month', (SELECT COALESCE(sum(total),0) FROM public.orders WHERE status NOT IN ('cancelled','returned') AND created_at >= date_trunc('month', now())),
    'products_total', (SELECT count(*) FROM public.products),
    'products_out', (SELECT count(*) FROM public.products WHERE stock <= 0),
    'products_low', (SELECT count(*) FROM public.products WHERE stock > 0 AND stock <= low_stock_threshold),
    'customers_total', (SELECT count(*) FROM public.profiles),
    'reviews_pending', (SELECT count(*) FROM public.reviews WHERE NOT is_approved),
    'daily', (SELECT COALESCE(jsonb_agg(d ORDER BY d->>'day'), '[]'::jsonb) FROM (
        SELECT jsonb_build_object('day', to_char(day, 'YYYY-MM-DD'), 'orders', COALESCE(o.cnt,0), 'revenue', COALESCE(o.sum_total,0)) AS d
        FROM generate_series(date_trunc('day', now()) - interval '13 days', date_trunc('day', now()), interval '1 day') AS day
        LEFT JOIN (
          SELECT date_trunc('day', created_at) AS d2, count(*) AS cnt, sum(total) AS sum_total
          FROM public.orders WHERE created_at >= date_trunc('day', now()) - interval '13 days'
            AND status NOT IN ('cancelled','returned')
          GROUP BY 1
        ) o ON o.d2 = day
      ) s)
  ) END;
$$;

REVOKE ALL ON FUNCTION public.admin_dashboard_stats() FROM public;
GRANT EXECUTE ON FUNCTION public.admin_dashboard_stats() TO authenticated;