import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminHeading } from "@/components/admin/AdminShell";
import { MediaInput } from "@/components/admin/MediaInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/admin/products/$id")({
  component: ProductEditorPage,
});

type Spec = { label: string; value: string };
type VariantDraft = {
  id?: string;
  size: string;
  color: string;
  sku: string;
  price: string;
  stock: string;
};

type Form = {
  name: string;
  slug: string;
  sku: string;
  short_description: string;
  description: string;
  price: string;
  sale_price: string;
  stock: string;
  low_stock_threshold: string;
  category_id: string;
  tags: string;
  sizes: string;
  colors: string;
  thumbnail_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  is_trending: boolean;
  is_hot: boolean;
  is_best_selling: boolean;
};

const emptyForm: Form = {
  name: "",
  slug: "",
  sku: "",
  short_description: "",
  description: "",
  price: "",
  sale_price: "",
  stock: "0",
  low_stock_threshold: "5",
  category_id: "none",
  tags: "",
  sizes: "",
  colors: "",
  thumbnail_url: null,
  is_published: true,
  is_featured: false,
  is_trending: false,
  is_hot: false,
  is_best_selling: false,
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function csv(value: string) {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function ProductEditorPage() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState<Form>(emptyForm);
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantDraft[]>([]);

  const { data: categories = [] } = useQuery({
    queryKey: ["admin", "categories", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id,name")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ["admin", "product", id],
    enabled: !isNew,
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(*), product_variants(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as Product) ?? null;
    },
  });

  useEffect(() => {
    if (!product) return;
    setForm({
      name: product.name,
      slug: product.slug,
      sku: product.sku ?? "",
      short_description: product.short_description ?? "",
      description: product.description ?? "",
      price: String(product.price ?? ""),
      sale_price: product.sale_price ? String(product.sale_price) : "",
      stock: String(product.stock ?? 0),
      low_stock_threshold: String(product.low_stock_threshold ?? 5),
      category_id: product.category_id ?? "none",
      tags: (product.tags ?? []).join(", "),
      sizes: (product.sizes ?? []).join(", "),
      colors: (product.colors ?? []).join(", "),
      thumbnail_url: product.thumbnail_url,
      is_published: product.is_published,
      is_featured: product.is_featured,
      is_trending: product.is_trending,
      is_hot: product.is_hot,
      is_best_selling: product.is_best_selling,
    });
    setSpecs(product.specifications ?? []);
    setGallery(
      (product.product_images ?? [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((i) => i.image_url),
    );
    setVariants(
      (product.product_variants ?? []).map((v) => ({
        id: v.id,
        size: v.size ?? "",
        color: v.color ?? "",
        sku: v.sku ?? "",
        price: v.price ? String(v.price) : "",
        stock: String(v.stock ?? 0),
      })),
    );
  }, [product]);

  const save = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error("পণ্যের নাম দিতে হবে");
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        sku: form.sku.trim() || null,
        short_description: form.short_description.trim() || null,
        description: form.description.trim() || null,
        specifications: specs.filter((s) => s.label.trim()),
        price: Number(form.price || 0),
        sale_price: form.sale_price ? Number(form.sale_price) : null,
        stock: Number(form.stock || 0),
        low_stock_threshold: Number(form.low_stock_threshold || 5),
        category_id: form.category_id === "none" ? null : form.category_id,
        tags: csv(form.tags),
        sizes: csv(form.sizes),
        colors: csv(form.colors),
        thumbnail_url: form.thumbnail_url,
        is_published: form.is_published,
        is_featured: form.is_featured,
        is_trending: form.is_trending,
        is_hot: form.is_hot,
        is_best_selling: form.is_best_selling,
      };

      let productId = id;
      if (isNew) {
        const { data, error } = await supabase
          .from("products")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        productId = data.id;
      } else {
        const { error } = await supabase.from("products").update(payload).eq("id", id);
        if (error) throw error;
      }

      // Replace gallery images with the current list.
      await supabase.from("product_images").delete().eq("product_id", productId);
      if (gallery.length) {
        const { error } = await supabase.from("product_images").insert(
          gallery.map((url, index) => ({
            product_id: productId,
            image_url: url,
            sort_order: index,
          })),
        );
        if (error) throw error;
      }

      // Replace variants with the current list.
      await supabase.from("product_variants").delete().eq("product_id", productId);
      const validVariants = variants.filter((v) => v.size.trim() || v.color.trim());
      if (validVariants.length) {
        const { error } = await supabase.from("product_variants").insert(
          validVariants.map((v) => ({
            product_id: productId,
            size: v.size.trim() || null,
            color: v.color.trim() || null,
            sku: v.sku.trim() || null,
            price: v.price ? Number(v.price) : null,
            stock: Number(v.stock || 0),
          })),
        );
        if (error) throw error;
      }

      return productId;
    },
    onSuccess: () => {
      toast.success("পণ্য সংরক্ষণ হয়েছে");
      void qc.invalidateQueries({ queryKey: ["admin"] });
      void qc.invalidateQueries({ queryKey: ["products"] });
      void navigate({ to: "/admin/products" });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "সংরক্ষণ করা যায়নি"),
  });

  if (!isNew && isLoading) return <Skeleton className="h-96 w-full rounded-lg" />;

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div>
      <AdminHeading
        title={isNew ? "নতুন পণ্য যোগ করুন" : "পণ্য সম্পাদনা"}
        description="সব তথ্য পূরণ করে সংরক্ষণ করুন"
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/products">
              <ArrowLeft className="size-4" /> ফিরে যান
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">মূল তথ্য</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>পণ্যের নাম *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      name: value,
                      slug: prev.slug || slugify(value),
                    }));
                  }}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>ইউআরএল (slug)</Label>
                  <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>পণ্য কোড (SKU)</Label>
                  <Input value={form.sku} onChange={(e) => set("sku", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>সংক্ষিপ্ত বিবরণ</Label>
                <Textarea
                  rows={2}
                  value={form.short_description}
                  onChange={(e) => set("short_description", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>বিস্তারিত বিবরণ</Label>
                <Textarea
                  rows={6}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">দাম ও স্টক</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>নিয়মিত দাম *</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>ছাড়ের দাম</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.sale_price}
                  onChange={(e) => set("sale_price", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>স্টক</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => set("stock", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>স্টক কম হওয়ার সতর্কতা</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.low_stock_threshold}
                  onChange={(e) => set("low_stock_threshold", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">সাইজ, রঙ ও ট্যাগ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>সাইজ (কমা দিয়ে লিখুন)</Label>
                <Input
                  placeholder="S, M, L, XL"
                  value={form.sizes}
                  onChange={(e) => set("sizes", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>রঙ (কমা দিয়ে লিখুন)</Label>
                <Input
                  placeholder="লাল, কালো, সাদা"
                  value={form.colors}
                  onChange={(e) => set("colors", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>ট্যাগ (কমা দিয়ে লিখুন)</Label>
                <Input value={form.tags} onChange={(e) => set("tags", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">ভ্যারিয়েন্ট ও আলাদা স্টক</CardTitle>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setVariants((v) => [
                    ...v,
                    { size: "", color: "", sku: "", price: "", stock: "0" },
                  ])
                }
              >
                <Plus className="size-4" /> যোগ করুন
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {variants.map((v, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-6">
                  <Input
                    placeholder="সাইজ"
                    value={v.size}
                    onChange={(e) =>
                      setVariants((list) =>
                        list.map((item, idx) =>
                          idx === i ? { ...item, size: e.target.value } : item,
                        ),
                      )
                    }
                  />
                  <Input
                    placeholder="রঙ"
                    value={v.color}
                    onChange={(e) =>
                      setVariants((list) =>
                        list.map((item, idx) =>
                          idx === i ? { ...item, color: e.target.value } : item,
                        ),
                      )
                    }
                  />
                  <Input
                    placeholder="কোড"
                    value={v.sku}
                    onChange={(e) =>
                      setVariants((list) =>
                        list.map((item, idx) =>
                          idx === i ? { ...item, sku: e.target.value } : item,
                        ),
                      )
                    }
                  />
                  <Input
                    placeholder="দাম"
                    type="number"
                    value={v.price}
                    onChange={(e) =>
                      setVariants((list) =>
                        list.map((item, idx) =>
                          idx === i ? { ...item, price: e.target.value } : item,
                        ),
                      )
                    }
                  />
                  <Input
                    placeholder="স্টক"
                    type="number"
                    value={v.stock}
                    onChange={(e) =>
                      setVariants((list) =>
                        list.map((item, idx) =>
                          idx === i ? { ...item, stock: e.target.value } : item,
                        ),
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="সরান"
                    onClick={() => setVariants((list) => list.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {!variants.length && (
                <p className="text-sm text-muted-foreground">
                  ভ্যারিয়েন্ট ছাড়া পণ্যের মূল স্টকই ব্যবহৃত হবে।
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">স্পেসিফিকেশন</CardTitle>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSpecs((s) => [...s, { label: "", value: "" }])}
              >
                <Plus className="size-4" /> যোগ করুন
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {specs.map((s, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <Input
                    placeholder="যেমন: কাপড়"
                    value={s.label}
                    onChange={(e) =>
                      setSpecs((list) =>
                        list.map((item, idx) =>
                          idx === i ? { ...item, label: e.target.value } : item,
                        ),
                      )
                    }
                  />
                  <Input
                    placeholder="যেমন: কটন"
                    value={s.value}
                    onChange={(e) =>
                      setSpecs((list) =>
                        list.map((item, idx) =>
                          idx === i ? { ...item, value: e.target.value } : item,
                        ),
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="সরান"
                    onClick={() => setSpecs((list) => list.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {!specs.length && (
                <p className="text-sm text-muted-foreground">কোনো স্পেসিফিকেশন যোগ করা হয়নি।</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ছবি</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MediaInput
                label="প্রধান ছবি"
                folder="products"
                value={form.thumbnail_url}
                onChange={(url) => set("thumbnail_url", url)}
              />
              <div className="space-y-2">
                <Label>গ্যালারি ছবি</Label>
                <div className="grid grid-cols-3 gap-2">
                  {gallery.map((url, i) => (
                    <div key={`${url}-${i}`} className="relative">
                      <img src={url} alt="" className="aspect-square w-full rounded-md object-cover" />
                      <button
                        type="button"
                        aria-label="সরান"
                        onClick={() => setGallery((list) => list.filter((_, idx) => idx !== i))}
                        className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-foreground/70 text-background"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <MediaInput
                  label="নতুন গ্যালারি ছবি যোগ করুন"
                  folder="products"
                  value={null}
                  onChange={(url) => {
                    if (url) setGallery((list) => [...list, url]);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">ক্যাটাগরি ও প্রদর্শন</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>ক্যাটাগরি</Label>
                <Select
                  value={form.category_id}
                  onValueChange={(value) => set("category_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">কোনো ক্যাটাগরি নয়</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <ToggleRow
                label="ওয়েবসাইটে প্রকাশিত"
                checked={form.is_published}
                onChange={(v) => set("is_published", v)}
              />
              <ToggleRow
                label="ফিচার্ড পণ্য"
                checked={form.is_featured}
                onChange={(v) => set("is_featured", v)}
              />
              <ToggleRow
                label="ট্রেন্ডিং"
                checked={form.is_trending}
                onChange={(v) => set("is_trending", v)}
              />
              <ToggleRow label="হট ডিল" checked={form.is_hot} onChange={(v) => set("is_hot", v)} />
              <ToggleRow
                label="বেস্ট সেলিং"
                checked={form.is_best_selling}
                onChange={(v) => set("is_best_selling", v)}
              />
            </CardContent>
          </Card>

          <Button
            className="w-full"
            size="lg"
            disabled={save.isPending}
            onClick={() => save.mutate()}
          >
            সংরক্ষণ করুন
          </Button>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="font-normal">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
