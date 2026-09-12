-- Run this once in Supabase SQL Editor for an existing project.
-- It makes the first verified account admin and enables automatic admin setup.

CREATE OR REPLACE FUNCTION public.handle_first_verified_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_first_verified_user() FROM public, anon, authenticated;
DROP TRIGGER IF EXISTS on_first_user_verified ON auth.users;
CREATE TRIGGER on_first_user_verified
  AFTER UPDATE OF confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_first_verified_user();

REVOKE ALL ON FUNCTION public.claim_admin() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;

DO $$
DECLARE first_verified_user uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    SELECT id INTO first_verified_user
    FROM auth.users
    WHERE confirmed_at IS NOT NULL
    ORDER BY created_at
    LIMIT 1;

    IF first_verified_user IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (first_verified_user, 'admin')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END;
$$;
