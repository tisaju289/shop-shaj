
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
