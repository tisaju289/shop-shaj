-- ============================================================
-- আমার স্টোর — সম্পূর্ণ ডাটাবেজ সেটআপ SQL
-- নতুন Supabase প্রজেক্টের SQL Editor-এ এই ফাইলটি সম্পূর্ণ রান করুন
-- ============================================================


-- ============ Migration: supabase/migrations/20260909163023_1098c469-83c2-4f9d-b71a-ea8f8aa09810.sql ============

-- roles
CREATE TYPE public.app_role AS ENUM ('admin','staff','customer');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','staff'));
$$;

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  address text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (id = auth.uid() OR public.is_admin()) WITH CHECK (id = auth.uid() OR public.is_admin());
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- categories
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  banner_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX categories_slug_idx ON public.categories(slug);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT USING (is_active OR public.is_admin());
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER categories_touch BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sku text,
  short_description text,
  description text,
  specifications jsonb NOT NULL DEFAULT '[]'::jsonb,
  price numeric(12,2) NOT NULL DEFAULT 0,
  sale_price numeric(12,2),
  stock int NOT NULL DEFAULT 0,
  low_stock_threshold int NOT NULL DEFAULT 5,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  sizes text[] NOT NULL DEFAULT '{}',
  colors text[] NOT NULL DEFAULT '{}',
  thumbnail_url text,
  is_published boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  is_trending boolean NOT NULL DEFAULT false,
  is_hot boolean NOT NULL DEFAULT false,
  is_best_selling boolean NOT NULL DEFAULT false,
  sales_count int NOT NULL DEFAULT 0,
  rating numeric(3,2) NOT NULL DEFAULT 0,
  review_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_slug_idx ON public.products(slug);
CREATE INDEX products_category_idx ON public.products(category_id);
CREATE INDEX products_published_idx ON public.products(is_published);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT USING (is_published OR public.is_admin());
CREATE POLICY "products admin write" ON public.products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER products_touch BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_images_product_idx ON public.product_images(product_id);
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product images public read" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "product images admin write" ON public.product_images FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size text,
  color text,
  sku text,
  price numeric(12,2),
  stock int NOT NULL DEFAULT 0,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_variants_product_idx ON public.product_variants(product_id);
GRANT SELECT ON public.product_variants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_variants TO authenticated;
GRANT ALL ON public.product_variants TO service_role;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "variants public read" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "variants admin write" ON public.product_variants FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER variants_touch BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- hero slides
CREATE TABLE public.hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subtitle text,
  heading text NOT NULL,
  description text,
  cta_text text,
  cta_url text,
  secondary_cta_text text,
  secondary_cta_url text,
  image_url text,
  mobile_image_url text,
  overlay_opacity numeric(3,2) NOT NULL DEFAULT 0.35,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hero_slides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_slides TO authenticated;
GRANT ALL ON public.hero_slides TO service_role;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hero public read" ON public.hero_slides FOR SELECT USING (is_active OR public.is_admin());
CREATE POLICY "hero admin write" ON public.hero_slides FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER hero_touch BEFORE UPDATE ON public.hero_slides FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- promotional banners
CREATE TABLE public.promotional_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  subtitle text,
  image_url text,
  mobile_image_url text,
  cta_text text,
  cta_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.promotional_banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promotional_banners TO authenticated;
GRANT ALL ON public.promotional_banners TO service_role;
ALTER TABLE public.promotional_banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "banners public read" ON public.promotional_banners FOR SELECT USING (is_active OR public.is_admin());
CREATE POLICY "banners admin write" ON public.promotional_banners FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER banners_touch BEFORE UPDATE ON public.promotional_banners FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- homepage sections
CREATE TABLE public.homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE,
  title text,
  subtitle text,
  is_visible boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  product_limit int NOT NULL DEFAULT 8,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.homepage_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homepage_sections TO authenticated;
GRANT ALL ON public.homepage_sections TO service_role;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sections public read" ON public.homepage_sections FOR SELECT USING (true);
CREATE POLICY "sections admin write" ON public.homepage_sections FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER sections_touch BEFORE UPDATE ON public.homepage_sections FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- store settings (single row keyed)
CREATE TABLE public.store_settings (
  id text PRIMARY KEY DEFAULT 'default',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.store_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.store_settings TO authenticated;
GRANT ALL ON public.store_settings TO service_role;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "settings admin write" ON public.store_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER settings_touch BEFORE UPDATE ON public.store_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- coupons
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL DEFAULT 'percentage',
  discount_value numeric(12,2) NOT NULL DEFAULT 0,
  min_order_amount numeric(12,2) NOT NULL DEFAULT 0,
  max_discount numeric(12,2),
  usage_limit int,
  used_count int NOT NULL DEFAULT 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coupons admin only" ON public.coupons FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER coupons_touch BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.validate_coupon(_code text, _subtotal numeric)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.coupons; d numeric;
BEGIN
  SELECT * INTO c FROM public.coupons WHERE lower(code) = lower(trim(_code)) LIMIT 1;
  IF c.id IS NULL THEN RETURN jsonb_build_object('valid', false, 'message', 'কুপন কোডটি সঠিক নয়'); END IF;
  IF NOT c.is_active THEN RETURN jsonb_build_object('valid', false, 'message', 'কুপনটি বর্তমানে সক্রিয় নয়'); END IF;
  IF c.starts_at IS NOT NULL AND now() < c.starts_at THEN RETURN jsonb_build_object('valid', false, 'message', 'কুপনটি এখনও শুরু হয়নি'); END IF;
  IF c.expires_at IS NOT NULL AND now() > c.expires_at THEN RETURN jsonb_build_object('valid', false, 'message', 'কুপনের মেয়াদ শেষ হয়েছে'); END IF;
  IF c.usage_limit IS NOT NULL AND c.used_count >= c.usage_limit THEN RETURN jsonb_build_object('valid', false, 'message', 'কুপনটির ব্যবহারের সীমা শেষ'); END IF;
  IF _subtotal < c.min_order_amount THEN RETURN jsonb_build_object('valid', false, 'message', 'সর্বনিম্ন অর্ডার মূল্য ' || c.min_order_amount::int || ' টাকা'); END IF;
  IF c.discount_type = 'percentage' THEN d := round(_subtotal * c.discount_value / 100, 2); ELSE d := c.discount_value; END IF;
  IF c.max_discount IS NOT NULL AND d > c.max_discount THEN d := c.max_discount; END IF;
  IF d > _subtotal THEN d := _subtotal; END IF;
  RETURN jsonb_build_object('valid', true, 'code', c.code, 'discount', d, 'message', 'কুপন সফলভাবে প্রয়োগ হয়েছে');
END; $$;
GRANT EXECUTE ON FUNCTION public.validate_coupon(text, numeric) TO anon, authenticated;

-- orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE DEFAULT ('ORD-' || to_char(now(),'YYMMDD') || '-' || lpad((floor(random()*100000))::text, 5, '0')),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_phone_alt text,
  customer_email text,
  address text NOT NULL,
  division text,
  district text,
  thana text,
  note text,
  admin_note text,
  delivery_zone text NOT NULL DEFAULT 'inside_dhaka',
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  delivery_charge numeric(12,2) NOT NULL DEFAULT 0,
  discount numeric(12,2) NOT NULL DEFAULT 0,
  coupon_code text,
  total numeric(12,2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'cod',
  payment_status text NOT NULL DEFAULT 'unpaid',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_status_idx ON public.orders(status);
CREATE INDEX orders_created_idx ON public.orders(created_at DESC);
GRANT INSERT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders guest insert" ON public.orders FOR INSERT TO anon WITH CHECK (user_id IS NULL);
CREATE POLICY "orders user insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "orders read own or admin" ON public.orders FOR SELECT TO authenticated USING (public.is_admin() OR user_id = auth.uid());
CREATE POLICY "orders admin update" ON public.orders FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "orders admin delete" ON public.orders FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER orders_touch BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_image text,
  size text,
  color text,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  quantity int NOT NULL DEFAULT 1,
  total numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX order_items_order_idx ON public.order_items(order_id);
GRANT INSERT ON public.order_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order items guest insert" ON public.order_items FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "order items user insert" ON public.order_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "order items read" ON public.order_items FOR SELECT TO authenticated USING (public.is_admin() OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "order items admin write" ON public.order_items FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "order items admin delete" ON public.order_items FOR DELETE TO authenticated USING (public.is_admin());

-- inventory transactions
CREATE TABLE public.inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  change int NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.inventory_transactions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_transactions TO authenticated;
GRANT ALL ON public.inventory_transactions TO service_role;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inventory admin read" ON public.inventory_transactions FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "inventory insert" ON public.inventory_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "inventory admin write" ON public.inventory_transactions FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- stock + sales update on order item insert
CREATE OR REPLACE FUNCTION public.apply_order_item() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.variant_id IS NOT NULL THEN
    UPDATE public.product_variants SET stock = GREATEST(stock - NEW.quantity, 0) WHERE id = NEW.variant_id;
  END IF;
  IF NEW.product_id IS NOT NULL THEN
    UPDATE public.products
      SET stock = GREATEST(stock - NEW.quantity, 0), sales_count = sales_count + NEW.quantity
      WHERE id = NEW.product_id;
    INSERT INTO public.inventory_transactions (product_id, variant_id, change, reason)
    VALUES (NEW.product_id, NEW.variant_id, -NEW.quantity, 'order');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER order_items_apply AFTER INSERT ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.apply_order_item();

-- reviews
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name text NOT NULL,
  rating int NOT NULL DEFAULT 5,
  comment text,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reviews_product_idx ON public.reviews(product_id);
GRANT SELECT, INSERT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public read" ON public.reviews FOR SELECT USING (is_approved OR public.is_admin() OR user_id = auth.uid());
CREATE POLICY "reviews insert" ON public.reviews FOR INSERT WITH CHECK (is_approved = false);
CREATE POLICY "reviews admin update" ON public.reviews FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "reviews admin delete" ON public.reviews FOR DELETE TO authenticated USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.refresh_product_rating() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pid uuid;
BEGIN
  pid := COALESCE(NEW.product_id, OLD.product_id);
  UPDATE public.products p SET
    rating = COALESCE((SELECT round(avg(rating)::numeric, 2) FROM public.reviews r WHERE r.product_id = pid AND r.is_approved), 0),
    review_count = COALESCE((SELECT count(*) FROM public.reviews r WHERE r.product_id = pid AND r.is_approved), 0)
  WHERE p.id = pid;
  RETURN NULL;
END; $$;
CREATE TRIGGER reviews_rating AFTER INSERT OR UPDATE OR DELETE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.refresh_product_rating();

-- wishlist
CREATE TABLE public.wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
GRANT SELECT, INSERT, DELETE ON public.wishlist TO authenticated;
GRANT ALL ON public.wishlist TO service_role;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wishlist own" ON public.wishlist FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============ Migration: supabase/migrations/20260909163148_38dd1731-4a05-4a26-8fe1-c7de94f53c18.sql ============

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.apply_order_item() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.refresh_product_rating() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;

INSERT INTO public.store_settings (id, data) VALUES ('default', jsonb_build_object(
  'store_name','রুকু অ্যালবাম',
  'tagline','প্রিমিয়াম বাংলাদেশি ফ্যাশন',
  'logo_url','',
  'favicon_url','',
  'phone','+8801700000000',
  'whatsapp','+8801700000000',
  'email','support@example.com',
  'address','১২৩, ধানমন্ডি, ঢাকা - ১২০৫',
  'facebook_url','https://facebook.com',
  'instagram_url','https://instagram.com',
  'tiktok_url','',
  'youtube_url','',
  'currency','৳',
  'delivery_charge_inside',60,
  'delivery_charge_outside',120,
  'free_delivery_threshold',3000,
  'min_order_amount',0,
  'cod_enabled',true,
  'meta_title','রুকু অ্যালবাম — প্রিমিয়াম বাংলাদেশি ফ্যাশন',
  'meta_description','শাড়ি, থ্রি-পিস, কুর্তি ও কামিজের একচেটিয়া কালেকশন। সারা বাংলাদেশে ক্যাশ অন ডেলিভারি।',
  'og_image','',
  'google_verification','',
  'footer_text','আমরা যত্ন করে বাছাই করা কাপড় ও নিখুঁত ফিনিশিংয়ে তৈরি পোশাক সারা দেশে পৌঁছে দিই।',
  'copyright_text','© ২০২৬ রুকু অ্যালবাম। সর্বস্বত্ব সংরক্ষিত।',
  'primary_color','#7a2b3f',
  'secondary_color','#c9a227',
  'radius','0.5rem',
  'about_text','আমরা একটি বাংলাদেশি ফ্যাশন ব্র্যান্ড, যারা দেশীয় তাঁতি ও কারিগরদের সাথে কাজ করে আধুনিক ও রুচিশীল পোশাক তৈরি করে।',
  'return_policy','ডেলিভারির ৩ দিনের মধ্যে অক্ষত অবস্থায় পণ্য ফেরত দেওয়া যাবে।',
  'privacy_policy','আপনার দেওয়া তথ্য শুধুমাত্র অর্ডার প্রক্রিয়াকরণের জন্য ব্যবহার করা হয়।',
  'terms','ওয়েবসাইট ব্যবহারের মাধ্যমে আপনি আমাদের শর্তাবলী মেনে নিচ্ছেন।'
));

INSERT INTO public.homepage_sections (section_key, title, subtitle, sort_order, product_limit) VALUES
 ('hero','','',1,0),
 ('categories','ক্যাটাগরি', 'আপনার পছন্দের কালেকশন বেছে নিন',2,0),
 ('best_selling','সর্বাধিক বিক্রিত','যা সবচেয়ে বেশি ভালোবাসা পেয়েছে',3,8),
 ('trending','ট্রেন্ডিং কালেকশন','এই মুহূর্তে যা জনপ্রিয়',4,8),
 ('promo_banners','বিশেষ অফার','',5,0),
 ('hot','হট প্রোডাক্ট','সীমিত সময়ের জন্য',6,8),
 ('newsletter','আমাদের সাথে থাকুন','নতুন কালেকশন ও অফারের খবর সবার আগে পান',7,0);

INSERT INTO public.categories (name, slug, description, sort_order) VALUES
 ('শাড়ি','saree','জামদানি, জর্জেট ও কটন শাড়ির অভিজাত সংগ্রহ',1),
 ('থ্রি-পিস','three-piece','আরামদায়ক ও রুচিশীল থ্রি-পিস কালেকশন',2),
 ('কুর্তি','kurti','প্রতিদিনের জন্য এমব্রয়ডারি ও প্রিন্টেড কুর্তি',3),
 ('কামিজ','kamiz','উৎসব ও দাওয়াতের জন্য কামিজ',4),
 ('টপস','tops','ক্যাজুয়াল লেডিস টপস',5),
 ('বটমস','bottoms','পালাজো, প্লাজো ও লেগিংস',6),
 ('হিজাব','hijab','প্রিমিয়াম হিজাব ও স্কার্ফ',7),
 ('নতুন কালেকশন','new-arrival','সদ্য আসা পোশাক',8);

INSERT INTO public.products (name, slug, sku, short_description, description, price, sale_price, stock, category_id, sizes, colors, tags, is_featured, is_trending, is_hot, is_best_selling, sales_count)
SELECT v.name, v.slug, v.sku, v.short_desc, v.long_desc, v.price, v.sale_price, v.stock,
  (SELECT id FROM public.categories c WHERE c.slug = v.cat), v.sizes, v.colors, v.tags,
  v.featured, v.trending, v.hot, v.best, v.sales
FROM (VALUES
 ('এলিগেন্ট কটন থ্রি-পিস','elegant-cotton-three-piece','RA-TP-001','নরম কটনে আরামদায়ক থ্রি-পিস','উন্নত মানের কটন কাপড়ে তৈরি, হাতের কাজ করা নেকলাইন। সাথে ওড়না ও সালোয়ার অন্তর্ভুক্ত।',2450,1990,25,'three-piece',ARRAY['S','M','L','XL'],ARRAY['মেরুন','নেভি','অফ হোয়াইট'],ARRAY['কটন','থ্রি-পিস'],true,true,false,true,42),
 ('প্রিমিয়াম জর্জেট শাড়ি','premium-georgette-saree','RA-SR-001','হালকা ও ঝলমলে জর্জেট শাড়ি','সফট জর্জেটের উপর সূক্ষ্ম কাজ, ব্লাউজ পিস সহ। যেকোনো অনুষ্ঠানে আভিজাত্য।',3900,3250,14,'saree',ARRAY['ফ্রি সাইজ'],ARRAY['গোল্ডেন','কালো','লাল'],ARRAY['শাড়ি','জর্জেট'],true,false,true,true,58),
 ('এমব্রয়ডারি কুর্তি','embroidery-kurti','RA-KT-001','হাতের কাজ করা প্রিমিয়াম কুর্তি','ভিসকস কাপড়ে সুনিপুণ এমব্রয়ডারি, প্রতিদিন ও অফিসে পরার উপযোগী।',1650,1290,40,'kurti',ARRAY['S','M','L','XL','XXL'],ARRAY['সাদা','পিচ','ধূসর'],ARRAY['কুর্তি'],true,true,true,true,73),
 ('সিল্ক ফিউশন কামিজ','silk-fusion-kamiz','RA-KM-001','উৎসবের জন্য সিল্ক কামিজ','সেমি-সিল্ক কাপড়, চওড়া হাতা ও মসৃণ ফিনিশিং।',2850,NULL,18,'kamiz',ARRAY['M','L','XL'],ARRAY['টিল','মভ'],ARRAY['কামিজ','সিল্ক'],false,true,false,false,21),
 ('ক্যাজুয়াল লেডিস টপ','casual-ladies-top','RA-TS-001','প্রতিদিনের আরামদায়ক টপ','স্ট্রেচেবল কটন জার্সি, সহজে ধোয়া যায়।',890,690,60,'tops',ARRAY['S','M','L'],ARRAY['কালো','সাদা','অলিভ'],ARRAY['টপস'],false,false,true,true,64),
 ('জামদানি হাফ সিল্ক শাড়ি','jamdani-half-silk-saree','RA-SR-002','তাঁতির হাতে বোনা জামদানি','হাফ সিল্ক জামদানি, ঐতিহ্যবাহী নকশা।',5600,4990,8,'saree',ARRAY['ফ্রি সাইজ'],ARRAY['আকাশি','সবুজ'],ARRAY['জামদানি'],true,false,false,true,37),
 ('প্রিন্টেড পালাজো','printed-palazzo','RA-BT-001','আরামদায়ক প্রিন্টেড পালাজো','রেয়ন কাপড়, ইলাস্টিক কোমর।',750,590,55,'bottoms',ARRAY['ফ্রি সাইজ'],ARRAY['কালো','মেরুন'],ARRAY['বটমস'],false,true,false,false,29),
 ('প্রিমিয়াম জর্জেট হিজাব','premium-georgette-hijab','RA-HJ-001','মসৃণ ও হালকা হিজাব','প্রিমিয়াম জর্জেট, রঙ দীর্ঘস্থায়ী।',450,380,90,'hijab',ARRAY['ফ্রি সাইজ'],ARRAY['কালো','বেইজ','বাদামি'],ARRAY['হিজাব'],false,false,true,true,88)
) AS v(name, slug, sku, short_desc, long_desc, price, sale_price, stock, cat, sizes, colors, tags, featured, trending, hot, best, sales);

INSERT INTO public.hero_slides (subtitle, heading, description, cta_text, cta_url, secondary_cta_text, secondary_cta_url, sort_order) VALUES
 ('নতুন কালেকশন ২০২৬','ঐতিহ্য ও আধুনিকতার মেলবন্ধন','যত্নে বাছাই করা কাপড়, নিখুঁত ফিনিশিং — প্রতিদিনের জন্য অভিজাত পোশাক।','এখনই শপ করুন','/shop','কালেকশন দেখুন','/category/new-arrival',1),
 ('উৎসব কালেকশন','শাড়িতে বাঙালিয়ানা','জামদানি থেকে জর্জেট — প্রতিটি শাড়িতে গল্প।','এখনই শপ করুন','/category/saree',NULL,NULL,2);

INSERT INTO public.promotional_banners (title, subtitle, cta_text, cta_url, sort_order) VALUES
 ('ঈদ অফার — ৩০% পর্যন্ত ছাড়','নির্বাচিত থ্রি-পিস ও কুর্তিতে','অফার দেখুন','/offers',1),
 ('৩০০০ টাকার উপরে ফ্রি ডেলিভারি','সারা বাংলাদেশে','শপিং শুরু করুন','/shop',2);

INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount, max_discount, is_active) VALUES
 ('WELCOME10','percentage',10,1000,500,true);

-- ============ Migration: supabase/migrations/20260909163220_25a4bb4b-1207-4bf7-92c9-24e4891a482b.sql ============

CREATE POLICY "store media public read" ON storage.objects FOR SELECT USING (bucket_id = 'store-media');
CREATE POLICY "store media admin insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'store-media' AND public.is_admin());
CREATE POLICY "store media admin update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'store-media' AND public.is_admin()) WITH CHECK (bucket_id = 'store-media' AND public.is_admin());
CREATE POLICY "store media admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'store-media' AND public.is_admin());

-- ============ Migration: supabase/migrations/20260909165932_e41ada92-f3d2-459c-a515-6e7411d2ac97.sql ============
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
-- ============ Migration: supabase/migrations/20260909170007_6a278619-eee0-4ba1-9d75-c7e805214331.sql ============
REVOKE EXECUTE ON FUNCTION public.claim_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_dashboard_stats() FROM anon;
-- ============ Migration: supabase/migrations/20260911150954_0df69c2f-1eb8-43f1-9243-e70f0328f9ed.sql ============
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
-- ============ Migration: supabase/migrations/20260911151034_e82b682c-225f-4ae5-a89c-1b27d8a11a02.sql ============
CREATE POLICY "Backend manages tracking events" ON public.tracking_events FOR ALL TO service_role USING (true) WITH CHECK (true);
-- ============ Migration: supabase/migrations/20260911155421_3879859e-8db8-454a-818f-d24101b61087.sql ============
REVOKE ALL ON FUNCTION public.claim_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_coupon(text, numeric) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.apply_order_item() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.refresh_product_rating() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_dashboard_stats() TO authenticated;
-- ============ Migration: supabase/migrations/20260911155447_ecfb9a27-e3b9-42fc-8b06-eaaaeba2f020.sql ============
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
-- ============ Migration: supabase/migrations/20260911155722_7defce47-7452-474a-9e21-b90dab4a70b1.sql ============
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
-- ============ Storage bucket ============
-- ছবি আপলোডের জন্য বাকেট (প্রাইভেট; অ্যাডমিন প্যানেল থেকে আপলোড হয়)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('store-media', 'store-media', false, 10485760,
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/avif'])
ON CONFLICT (id) DO NOTHING;

-- সাইনড URL দিয়ে ছবি দেখা/আপলোড — বাকেটের মালিক অ্যাডমিন
CREATE POLICY "admin manage store media" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'store-media' AND public.is_admin())
  WITH CHECK (bucket_id = 'store-media' AND public.is_admin());

CREATE POLICY "public read store media" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'store-media');
