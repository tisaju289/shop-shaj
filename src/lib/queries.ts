import { supabase } from "@/integrations/supabase/client";
import type {
  Category,
  HeroSlide,
  HomepageSection,
  Product,
  PromoBanner,
  Review,
} from "@/lib/types";

const PRODUCT_LIST_FIELDS =
  "id,name,slug,price,sale_price,stock,thumbnail_url,rating,review_count,sales_count,is_published,is_featured,is_trending,is_hot,is_best_selling,category_id,created_at,sizes,colors,sku,tags";

export const categoriesQuery = {
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as Category[];
  },
  staleTime: 5 * 60_000,
};

export const heroSlidesQuery = {
  queryKey: ["hero-slides"],
  queryFn: async (): Promise<HeroSlide[]> => {
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as HeroSlide[];
  },
  staleTime: 5 * 60_000,
};

export const promoBannersQuery = {
  queryKey: ["promo-banners"],
  queryFn: async (): Promise<PromoBanner[]> => {
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from("promotional_banners")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return ((data ?? []) as PromoBanner[]).filter(
      (b) =>
        (!b.starts_at || b.starts_at <= nowIso) && (!b.ends_at || b.ends_at >= nowIso),
    );
  },
  staleTime: 60_000,
};

export const homepageSectionsQuery = {
  queryKey: ["homepage-sections"],
  queryFn: async (): Promise<HomepageSection[]> => {
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as HomepageSection[];
  },
  staleTime: 5 * 60_000,
};

export type ProductFlag = "best_selling" | "trending" | "hot" | "featured" | "new";

export function flaggedProductsQuery(flag: ProductFlag, limit: number) {
  return {
    queryKey: ["products", "flag", flag, limit],
    queryFn: async (): Promise<Product[]> => {
      let query = supabase
        .from("products")
        .select(PRODUCT_LIST_FIELDS)
        .eq("is_published", true)
        .limit(limit);

      if (flag === "best_selling")
        query = query.or("is_best_selling.eq.true,sales_count.gt.0").order("sales_count", {
          ascending: false,
        });
      else if (flag === "trending")
        query = query.eq("is_trending", true).order("updated_at", { ascending: false });
      else if (flag === "hot")
        query = query.eq("is_hot", true).order("updated_at", { ascending: false });
      else if (flag === "featured")
        query = query.eq("is_featured", true).order("sort_order" as never, {
          ascending: true,
        } as never);
      else query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as Product[];
    },
    staleTime: 60_000,
  };
}

export type ShopFilters = {
  category?: string | undefined;
  search?: string | undefined;
  sort?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  sizes?: string[] | undefined;
  colors?: string[] | undefined;
  inStock?: boolean | undefined;
  page?: number | undefined;
  perPage?: number | undefined;
};

export function shopProductsQuery(filters: ShopFilters) {
  const perPage = filters.perPage ?? 12;
  const page = filters.page ?? 1;
  return {
    queryKey: ["products", "shop", filters],
    queryFn: async (): Promise<{ items: Product[]; total: number }> => {
      let query = supabase
        .from("products")
        .select(PRODUCT_LIST_FIELDS, { count: "exact" })
        .eq("is_published", true);

      if (filters.category) {
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", filters.category)
          .maybeSingle();
        query = query.eq("category_id", cat?.id ?? "00000000-0000-0000-0000-000000000000");
      }
      if (filters.search) {
        const term = `%${filters.search}%`;
        query = query.or(`name.ilike.${term},sku.ilike.${term}`);
      }
      if (filters.minPrice != null) query = query.gte("price", filters.minPrice);
      if (filters.maxPrice != null) query = query.lte("price", filters.maxPrice);
      if (filters.sizes?.length) query = query.overlaps("sizes", filters.sizes);
      if (filters.colors?.length) query = query.overlaps("colors", filters.colors);
      if (filters.inStock) query = query.gt("stock", 0);

      switch (filters.sort) {
        case "price_asc":
          query = query.order("price", { ascending: true });
          break;
        case "price_desc":
          query = query.order("price", { ascending: false });
          break;
        case "best_selling":
          query = query.order("sales_count", { ascending: false });
          break;
        case "rating":
          query = query.order("rating", { ascending: false });
          break;
        case "popular":
          query = query.order("review_count", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const from = (page - 1) * perPage;
      const { data, error, count } = await query.range(from, from + perPage - 1);
      if (error) throw error;
      return { items: (data ?? []) as unknown as Product[], total: count ?? 0 };
    },
    staleTime: 30_000,
  };
}

export function productQuery(slug: string) {
  return {
    queryKey: ["product", slug],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(*), product_variants(*), categories(name,slug)")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as Product) ?? null;
    },
    staleTime: 60_000,
  };
}

export function relatedProductsQuery(categoryId: string | null, excludeId: string) {
  return {
    queryKey: ["products", "related", categoryId, excludeId],
    queryFn: async (): Promise<Product[]> => {
      let query = supabase
        .from("products")
        .select(PRODUCT_LIST_FIELDS)
        .eq("is_published", true)
        .neq("id", excludeId)
        .limit(8);
      if (categoryId) query = query.eq("category_id", categoryId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as Product[];
    },
  };
}

export function productReviewsQuery(productId: string) {
  return {
    queryKey: ["reviews", productId],
    queryFn: async (): Promise<Review[]> => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Review[];
    },
  };
}

export function productsByIdsQuery(ids: string[]) {
  return {
    queryKey: ["products", "by-ids", ids],
    queryFn: async (): Promise<Product[]> => {
      if (!ids.length) return [];
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_LIST_FIELDS)
        .in("id", ids)
        .eq("is_published", true);
      if (error) throw error;
      return (data ?? []) as unknown as Product[];
    },
  };
}

export function categoryQuery(slug: string) {
  return {
    queryKey: ["category", slug],
    queryFn: async (): Promise<Category | null> => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return (data as Category) ?? null;
    },
    staleTime: 5 * 60_000,
  };
}

export const saleProductsQuery = {
  queryKey: ["products", "sale"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_LIST_FIELDS)
      .eq("is_published", true)
      .not("sale_price", "is", null)
      .order("created_at", { ascending: false })
      .limit(48);
    if (error) throw error;
    return (data ?? []) as unknown as Product[];
  },
  staleTime: 30_000,
};
