import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState, ErrorState, ProductGridSkeleton } from "@/components/storefront/LoadingSkeleton";
import { ProductGrid } from "@/components/storefront/ProductCarousel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { categoriesQuery, shopProductsQuery } from "@/lib/queries";

const SORTS = [
  { value: "new", label: "নতুন" },
  { value: "popular", label: "জনপ্রিয়" },
  { value: "price_asc", label: "কম দাম থেকে বেশি" },
  { value: "price_desc", label: "বেশি দাম থেকে কম" },
  { value: "best_selling", label: "সর্বাধিক বিক্রিত" },
  { value: "rating", label: "সর্বাধিক রেটিং" },
];

const SIZES = ["S", "M", "L", "XL", "XXL", "ফ্রি সাইজ"];
const COLORS = ["কালো", "সাদা", "মেরুন", "নেভি", "গোল্ডেন", "লাল", "সবুজ", "বেইজ"];
const PER_PAGE = 12;

export function ShopBrowser({
  fixedCategory,
  hideCategoryFilter,
  initialSearch,
}: {
  fixedCategory?: string;
  hideCategoryFilter?: boolean;
  initialSearch?: string;
}) {
  const [category, setCategory] = useState<string>(fixedCategory ?? "");
  const [sort, setSort] = useState("new");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [inStock, setInStock] = useState(false);
  const [page, setPage] = useState(1);

  const { data: categories = [] } = useQuery(categoriesQuery);

  const filters = useMemo(
    () => ({
      category: fixedCategory ?? (category || undefined),
      search: initialSearch || undefined,
      sort,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sizes: sizes.length ? sizes : undefined,
      colors: colors.length ? colors : undefined,
      inStock: inStock || undefined,
      page,
      perPage: PER_PAGE,
    }),
    [fixedCategory, category, initialSearch, sort, minPrice, maxPrice, sizes, colors, inStock, page],
  );

  const { data, isLoading, isError, refetch } = useQuery(shopProductsQuery(filters));
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  const hasFilters =
    (!fixedCategory && !!category) ||
    !!minPrice ||
    !!maxPrice ||
    sizes.length > 0 ||
    colors.length > 0 ||
    inStock;

  function clearFilters() {
    if (!fixedCategory) setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSizes([]);
    setColors([]);
    setInStock(false);
    setPage(1);
  }

  function toggle(list: string[], value: string, setter: (v: string[]) => void) {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
    setPage(1);
  }

  const filterPanel = (
    <div className="space-y-7">
      <FilterGroup title="দামের রেঞ্জ">
        <div className="flex items-center gap-2">
          <Input
            inputMode="numeric"
            placeholder="সর্বনিম্ন"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value.replace(/\D/g, ""));
              setPage(1);
            }}
          />
          <span className="shrink-0 text-muted-foreground">—</span>
          <Input
            inputMode="numeric"
            placeholder="সর্বোচ্চ"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value.replace(/\D/g, ""));
              setPage(1);
            }}
          />
        </div>
      </FilterGroup>

      {!hideCategoryFilter && (
        <FilterGroup title="ক্যাটাগরি">
          <div className="space-y-2">
            <button
              onClick={() => {
                setCategory("");
                setPage(1);
              }}
              className={`block text-sm ${category === "" ? "font-medium text-primary" : "text-muted-foreground"}`}
            >
              সব পণ্য
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setCategory(c.slug);
                  setPage(1);
                }}
                className={`block text-sm ${category === c.slug ? "font-medium text-primary" : "text-muted-foreground"}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </FilterGroup>
      )}

      <FilterGroup title="দামের রেঞ্জ">
        <div className="flex items-center gap-2">
          <Input
            inputMode="numeric"
            placeholder="সর্বনিম্ন"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value.replace(/\D/g, ""));
              setPage(1);
            }}
          />
          <span className="text-muted-foreground">—</span>
          <Input
            inputMode="numeric"
            placeholder="সর্বোচ্চ"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value.replace(/\D/g, ""));
              setPage(1);
            }}
          />
        </div>
      </FilterGroup>

      <FilterGroup title="সাইজ">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => toggle(sizes, s, setSizes)}
              className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                sizes.includes(s)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="রঙ">
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => toggle(colors, c, setColors)}
              className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                colors.includes(c)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="স্টক">
        <div className="flex items-center gap-2">
          <Checkbox
            id="in-stock"
            checked={inStock}
            onCheckedChange={(v) => {
              setInStock(Boolean(v));
              setPage(1);
            }}
          />
          <Label htmlFor="in-stock" className="text-sm font-normal">
            শুধু স্টকে থাকা পণ্য
          </Label>
        </div>
      </FilterGroup>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
          <X className="size-4" /> ফিল্টার মুছুন
        </Button>
      )}
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block">{filterPanel}</aside>

      <div>
        <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <p className="text-sm text-muted-foreground">{total} টি পণ্য পাওয়া গেছে</p>
          <div className="flex shrink-0 items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal className="size-4" /> ফিল্টার
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto">
                <SheetTitle className="mb-6 text-left">ফিল্টার</SheetTitle>
                {filterPanel}
              </SheetContent>
            </Sheet>
            <Select
              value={sort}
              onValueChange={(v) => {
                setSort(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-32 sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : isLoading ? (
          <ProductGridSkeleton />
        ) : data && data.items.length ? (
          <>
            <ProductGrid products={data.items} />
            {pages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  পূর্ববর্তী
                </Button>
                <span className="px-2 text-sm text-muted-foreground">
                  পৃষ্ঠা {page} / {pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  পরবর্তী
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="কোনো পণ্য পাওয়া যায়নি"
            description="ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।"
            action={
              hasFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  ফিল্টার মুছুন
                </Button>
              )
            }
          />
        )}
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}
