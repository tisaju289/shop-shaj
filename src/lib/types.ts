export type StoreSettings = {
  store_name: string;
  tagline: string;
  logo_url: string;
  favicon_url: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  facebook_url: string;
  instagram_url: string;
  tiktok_url: string;
  youtube_url: string;
  currency: string;
  delivery_charge_inside: number;
  delivery_charge_outside: number;
  free_delivery_threshold: number;
  min_order_amount: number;
  cod_enabled: boolean;
  meta_title: string;
  meta_description: string;
  og_image: string;
  google_verification: string;
  footer_text: string;
  copyright_text: string;
  primary_color: string;
  secondary_color: string;
  radius: string;
  about_text: string;
  return_policy: string;
  privacy_policy: string;
  terms: string;
};

export const defaultSettings: StoreSettings = {
  store_name: "আমার স্টোর",
  tagline: "প্রিমিয়াম বাংলাদেশি ফ্যাশন",
  logo_url: "",
  favicon_url: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  facebook_url: "",
  instagram_url: "",
  tiktok_url: "",
  youtube_url: "",
  currency: "৳",
  delivery_charge_inside: 60,
  delivery_charge_outside: 120,
  free_delivery_threshold: 0,
  min_order_amount: 0,
  cod_enabled: true,
  meta_title: "",
  meta_description: "",
  og_image: "",
  google_verification: "",
  footer_text: "",
  copyright_text: "",
  primary_color: "",
  secondary_color: "",
  radius: "0.5rem",
  about_text: "",
  return_policy: "",
  privacy_policy: "",
  terms: "",
};

export type Category = {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  banner_url: string | null;
  is_active: boolean;
  sort_order: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  short_description: string | null;
  description: string | null;
  specifications: { label: string; value: string }[];
  price: number;
  sale_price: number | null;
  stock: number;
  low_stock_threshold: number;
  category_id: string | null;
  tags: string[];
  sizes: string[];
  colors: string[];
  thumbnail_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  is_trending: boolean;
  is_hot: boolean;
  is_best_selling: boolean;
  sales_count: number;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
  categories?: { name: string; slug: string } | null;
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  sku: string | null;
  price: number | null;
  stock: number;
  image_url: string | null;
};

export type HeroSlide = {
  id: string;
  subtitle: string | null;
  heading: string;
  description: string | null;
  cta_text: string | null;
  cta_url: string | null;
  secondary_cta_text: string | null;
  secondary_cta_url: string | null;
  image_url: string | null;
  mobile_image_url: string | null;
  overlay_opacity: number;
  is_active: boolean;
  sort_order: number;
};

export type PromoBanner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  mobile_image_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  sort_order: number;
};

export type HomepageSection = {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  is_visible: boolean;
  sort_order: number;
  product_limit: number;
  config: Record<string, unknown>;
};

export type Order = {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_phone_alt: string | null;
  customer_email: string | null;
  address: string;
  division: string | null;
  district: string | null;
  thana: string | null;
  note: string | null;
  admin_note: string | null;
  delivery_zone: string;
  subtotal: number;
  delivery_charge: number;
  discount: number;
  coupon_code: string | null;
  total: number;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  product_image: string | null;
  size: string | null;
  color: string | null;
  unit_price: number;
  quantity: number;
  total: number;
};

export type Coupon = {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
};

export type Review = {
  id: string;
  product_id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  products?: { name: string } | null;
};

export const ORDER_STATUSES: { value: string; label: string }[] = [
  { value: "new", label: "নতুন অর্ডার" },
  { value: "confirmed", label: "নিশ্চিত করা হয়েছে" },
  { value: "processing", label: "প্রসেসিং" },
  { value: "packaging", label: "প্যাকেজিং" },
  { value: "shipped", label: "পাঠানো হয়েছে" },
  { value: "delivered", label: "ডেলিভারি সম্পন্ন" },
  { value: "cancelled", label: "বাতিল" },
  { value: "returned", label: "রিটার্ন" },
];

export const PAYMENT_STATUSES: { value: string; label: string }[] = [
  { value: "unpaid", label: "অপরিশোধিত" },
  { value: "paid", label: "পরিশোধিত" },
  { value: "refunded", label: "ফেরত দেওয়া হয়েছে" },
];

export const PAYMENT_METHODS: { value: string; label: string; enabled: boolean }[] = [
  { value: "cod", label: "ক্যাশ অন ডেলিভারি", enabled: true },
  { value: "bkash", label: "বিকাশ (শীঘ্রই আসছে)", enabled: false },
  { value: "nagad", label: "নগদ (শীঘ্রই আসছে)", enabled: false },
  { value: "rocket", label: "রকেট (শীঘ্রই আসছে)", enabled: false },
  { value: "sslcommerz", label: "কার্ড / SSLCommerz (শীঘ্রই আসছে)", enabled: false },
];

export const DIVISIONS = [
  "ঢাকা",
  "চট্টগ্রাম",
  "রাজশাহী",
  "খুলনা",
  "বরিশাল",
  "সিলেট",
  "রংপুর",
  "ময়মনসিংহ",
];

export function statusLabel(value: string) {
  return ORDER_STATUSES.find((s) => s.value === value)?.label ?? value;
}

export function paymentStatusLabel(value: string) {
  return PAYMENT_STATUSES.find((s) => s.value === value)?.label ?? value;
}
