import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdminHeading } from "@/components/admin/AdminShell";
import { MediaInput } from "@/components/admin/MediaInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { HeroSlide, HomepageSection, PromoBanner } from "@/lib/types";

export const Route = createFileRoute("/admin/appearance")({
  component: AppearancePage,
});

function AppearancePage() {
  return (
    <div>
      <AdminHeading
        title="হোমপেজ ও ব্যানার"
        description="স্লাইডার, প্রোমো ব্যানার ও হোমপেজের সেকশন নিয়ন্ত্রণ করুন"
      />
      <Tabs defaultValue="hero">
        <TabsList>
          <TabsTrigger value="hero">হিরো স্লাইডার</TabsTrigger>
          <TabsTrigger value="banners">প্রোমো ব্যানার</TabsTrigger>
          <TabsTrigger value="sections">হোমপেজ সেকশন</TabsTrigger>
        </TabsList>
        <TabsContent value="hero" className="pt-5">
          <HeroTab />
        </TabsContent>
        <TabsContent value="banners" className="pt-5">
          <BannerTab />
        </TabsContent>
        <TabsContent value="sections" className="pt-5">
          <SectionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------------- shared ---------------- */

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? "default" : "secondary"}>{active ? "সক্রিয়" : "নিষ্ক্রিয়"}</Badge>
  );
}

function Thumb({ url }: { url: string | null }) {
  if (!url) return <div className="size-12 rounded-md bg-accent" />;
  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      className="size-12 rounded-md object-cover"
    />
  );
}

function TableToolbar({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div className="mb-4 flex justify-end">
      <Button onClick={onAdd}>
        <Plus className="size-4" /> {label}
      </Button>
    </div>
  );
}

/* ---------------- Hero slides ---------------- */

const emptySlide = (order: number): HeroSlide => ({
  id: "new",
  subtitle: "",
  heading: "নতুন স্লাইড",
  description: "",
  cta_text: "",
  cta_url: "",
  secondary_cta_text: "",
  secondary_cta_url: "",
  image_url: null,
  mobile_image_url: null,
  overlay_opacity: 0,
  is_active: true,
  sort_order: order,
});

function HeroTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "hero-slides"],
    queryFn: async (): Promise<HeroSlide[]> => {
      const { data, error } = await supabase.from("hero_slides").select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as HeroSlide[];
    },
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin", "hero-slides"] });
    void qc.invalidateQueries({ queryKey: ["hero-slides"] });
  };

  const save = useMutation({
    mutationFn: async (slide: HeroSlide) => {
      const payload = {
        subtitle: slide.subtitle,
        heading: slide.heading,
        description: slide.description,
        cta_text: slide.cta_text,
        cta_url: slide.cta_url,
        secondary_cta_text: slide.secondary_cta_text,
        secondary_cta_url: slide.secondary_cta_url,
        image_url: slide.image_url,
        mobile_image_url: slide.mobile_image_url,
        overlay_opacity: Number(slide.overlay_opacity),
        is_active: slide.is_active,
        sort_order: Number(slide.sort_order),
      };
      const { error } =
        slide.id === "new"
          ? await supabase.from("hero_slides").insert(payload)
          : await supabase.from("hero_slides").update(payload).eq("id", slide.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("স্লাইড সংরক্ষণ হয়েছে");
      setEditing(null);
      invalidate();
    },
    onError: () => toast.error("সংরক্ষণ করা যায়নি"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hero_slides").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("স্লাইড মুছে ফেলা হয়েছে");
      invalidate();
    },
    onError: () => toast.error("মুছে ফেলা যায়নি"),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const { error } = await supabase.from("hero_slides").update({ is_active: value }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  if (isLoading) return <Skeleton className="h-64 w-full rounded-lg" />;

  const patch = (p: Partial<HeroSlide>) => setEditing((s) => (s ? { ...s, ...p } : s));

  return (
    <div>
      <TableToolbar label="নতুন স্লাইড" onAdd={() => setEditing(emptySlide(data.length))} />
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ছবি</TableHead>
              <TableHead>শিরোনাম</TableHead>
              <TableHead>ক্রম</TableHead>
              <TableHead>অবস্থা</TableHead>
              <TableHead className="text-right">কাজ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  এখনও কোনো স্লাইড নেই
                </TableCell>
              </TableRow>
            )}
            {data.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <Thumb url={s.image_url} />
                </TableCell>
                <TableCell className="font-medium">{s.heading || "স্লাইড"}</TableCell>
                <TableCell>{s.sort_order}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={s.is_active}
                      onCheckedChange={(v) => toggle.mutate({ id: s.id, value: v })}
                    />
                    <StatusBadge active={s.is_active} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="outline" aria-label="সম্পাদনা" onClick={() => setEditing(s)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label="মুছে ফেলুন"
                      onClick={() => remove.mutate(s.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing?.id === "new" ? "নতুন স্লাইড" : "স্লাইড সম্পাদনা"}</DialogTitle>
            <DialogDescription>হিরো স্লাইডের ছবি ও তথ্য নির্ধারণ করুন</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <Field
                  label="উপরের ছোট লেখা"
                  value={editing.subtitle ?? ""}
                  onChange={(v) => patch({ subtitle: v })}
                />
                <Field
                  label="প্রধান শিরোনাম"
                  value={editing.heading}
                  onChange={(v) => patch({ heading: v })}
                />
                <div className="space-y-1.5">
                  <Label>বিবরণ</Label>
                  <Textarea
                    rows={3}
                    value={editing.description ?? ""}
                    onChange={(e) => patch({ description: e.target.value })}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="বাটনের লেখা"
                    value={editing.cta_text ?? ""}
                    onChange={(v) => patch({ cta_text: v })}
                  />
                  <Field
                    label="বাটনের লিংক"
                    value={editing.cta_url ?? ""}
                    onChange={(v) => patch({ cta_url: v })}
                  />
                  <Field
                    label="ক্রম"
                    type="number"
                    value={String(editing.sort_order)}
                    onChange={(v) => patch({ sort_order: Number(v || 0) })}
                  />
                  <div className="flex items-center gap-2 pb-1 pt-6">
                    <Switch
                      checked={editing.is_active}
                      onCheckedChange={(v) => patch({ is_active: v })}
                    />
                    <Label className="font-normal">সক্রিয়</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <MediaInput
                  label="ডেস্কটপ ছবি (১৬:৫)"
                  hint="প্রস্তাবিত অনুপাত ১৬:৫ — ১৬০০×৫০০ পিক্সেল"
                  folder="hero"
                  value={editing.image_url}
                  onChange={(url) => patch({ image_url: url })}
                />
                <MediaInput
                  label="মোবাইল ছবি (১৬:৯)"
                  hint="প্রস্তাবিত অনুপাত ১৬:৯ — ৯০০×৫০৬ পিক্সেল"
                  folder="hero"
                  value={editing.mobile_image_url}
                  onChange={(url) => patch({ mobile_image_url: url })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              বাতিল
            </Button>
            <Button disabled={save.isPending} onClick={() => editing && save.mutate(editing)}>
              <Save className="size-4" /> সংরক্ষণ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- Promo banners ---------------- */

const emptyBanner = (order: number): PromoBanner => ({
  id: "new",
  title: "নতুন ব্যানার",
  subtitle: "",
  image_url: null,
  mobile_image_url: null,
  cta_text: "দেখুন",
  cta_url: "/offers",
  starts_at: null,
  ends_at: null,
  is_active: true,
  sort_order: order,
});

function BannerTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<PromoBanner | null>(null);
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "banners"],
    queryFn: async (): Promise<PromoBanner[]> => {
      const { data, error } = await supabase
        .from("promotional_banners")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as PromoBanner[];
    },
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin", "banners"] });
    void qc.invalidateQueries({ queryKey: ["promo-banners"] });
  };

  const save = useMutation({
    mutationFn: async (b: PromoBanner) => {
      const payload = {
        title: b.title,
        subtitle: b.subtitle,
        image_url: b.image_url,
        mobile_image_url: b.mobile_image_url,
        cta_text: b.cta_text,
        cta_url: b.cta_url,
        starts_at: b.starts_at,
        ends_at: b.ends_at,
        is_active: b.is_active,
        sort_order: Number(b.sort_order),
      };
      const { error } =
        b.id === "new"
          ? await supabase.from("promotional_banners").insert(payload)
          : await supabase.from("promotional_banners").update(payload).eq("id", b.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("ব্যানার সংরক্ষণ হয়েছে");
      setEditing(null);
      invalidate();
    },
    onError: () => toast.error("সংরক্ষণ করা যায়নি"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promotional_banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("ব্যানার মুছে ফেলা হয়েছে");
      invalidate();
    },
    onError: () => toast.error("মুছে ফেলা যায়নি"),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const { error } = await supabase
        .from("promotional_banners")
        .update({ is_active: value })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  if (isLoading) return <Skeleton className="h-64 w-full rounded-lg" />;

  const patch = (p: Partial<PromoBanner>) => setEditing((b) => (b ? { ...b, ...p } : b));

  return (
    <div>
      <TableToolbar label="নতুন ব্যানার" onAdd={() => setEditing(emptyBanner(data.length))} />
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ছবি</TableHead>
              <TableHead>শিরোনাম</TableHead>
              <TableHead>লিংক</TableHead>
              <TableHead>ক্রম</TableHead>
              <TableHead>অবস্থা</TableHead>
              <TableHead className="text-right">কাজ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  এখনও কোনো ব্যানার নেই
                </TableCell>
              </TableRow>
            )}
            {data.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  <Thumb url={b.image_url} />
                </TableCell>
                <TableCell className="font-medium">{b.title || "ব্যানার"}</TableCell>
                <TableCell className="text-muted-foreground">{b.cta_url || "—"}</TableCell>
                <TableCell>{b.sort_order}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={b.is_active}
                      onCheckedChange={(v) => toggle.mutate({ id: b.id, value: v })}
                    />
                    <StatusBadge active={b.is_active} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="outline" aria-label="সম্পাদনা" onClick={() => setEditing(b)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label="মুছে ফেলুন"
                      onClick={() => remove.mutate(b.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing?.id === "new" ? "নতুন ব্যানার" : "ব্যানার সম্পাদনা"}</DialogTitle>
            <DialogDescription>প্রোমো ব্যানারের ছবি ও তথ্য নির্ধারণ করুন</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <Field
                  label="শিরোনাম"
                  value={editing.title ?? ""}
                  onChange={(v) => patch({ title: v })}
                />
                <Field
                  label="সাব-শিরোনাম"
                  value={editing.subtitle ?? ""}
                  onChange={(v) => patch({ subtitle: v })}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="বাটনের লেখা"
                    value={editing.cta_text ?? ""}
                    onChange={(v) => patch({ cta_text: v })}
                  />
                  <Field
                    label="বাটনের লিংক"
                    value={editing.cta_url ?? ""}
                    onChange={(v) => patch({ cta_url: v })}
                  />
                  <div className="space-y-1.5">
                    <Label>শুরুর তারিখ</Label>
                    <Input
                      type="date"
                      value={editing.starts_at ? editing.starts_at.slice(0, 10) : ""}
                      onChange={(e) =>
                        patch({
                          starts_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>শেষ তারিখ</Label>
                    <Input
                      type="date"
                      value={editing.ends_at ? editing.ends_at.slice(0, 10) : ""}
                      onChange={(e) =>
                        patch({
                          ends_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                        })
                      }
                    />
                  </div>
                  <Field
                    label="ক্রম"
                    type="number"
                    value={String(editing.sort_order)}
                    onChange={(v) => patch({ sort_order: Number(v || 0) })}
                  />
                  <div className="flex items-center gap-2 pb-1 pt-6">
                    <Switch
                      checked={editing.is_active}
                      onCheckedChange={(v) => patch({ is_active: v })}
                    />
                    <Label className="font-normal">সক্রিয়</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <MediaInput
                  label="ডেস্কটপ ছবি"
                  hint="প্রস্তাবিত অনুপাত ১৬:৫ — ১৬০০×৫০০ পিক্সেল"
                  folder="banners"
                  value={editing.image_url}
                  onChange={(url) => patch({ image_url: url })}
                />
                <MediaInput
                  label="মোবাইল ছবি"
                  hint="প্রস্তাবিত অনুপাত ১৬:৯ — ৯০০×৫০৬ পিক্সেল"
                  folder="banners"
                  value={editing.mobile_image_url}
                  onChange={(url) => patch({ mobile_image_url: url })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              বাতিল
            </Button>
            <Button disabled={save.isPending} onClick={() => editing && save.mutate(editing)}>
              <Save className="size-4" /> সংরক্ষণ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- Homepage sections ---------------- */

const PRODUCT_FLAGS: { value: string; label: string }[] = [
  { value: "best_selling", label: "বেস্ট সেলিং পণ্য" },
  { value: "trending", label: "ট্রেন্ডিং পণ্য" },
  { value: "hot", label: "হট পণ্য" },
  { value: "featured", label: "ফিচার্ড পণ্য" },
  { value: "new", label: "নতুন পণ্য" },
];

const FIXED_KEYS = ["hero", "categories", "promo_banners", "newsletter"];

const sectionTypeLabel = (s: HomepageSection) => {
  const fixed: Record<string, string> = {
    hero: "হিরো স্লাইডার",
    categories: "ক্যাটাগরি",
    promo_banners: "প্রোমো ব্যানার",
    newsletter: "নিউজলেটার",
  };
  if (fixed[s.section_key]) return fixed[s.section_key]!;
  const flag = (s.config?.["flag"] as string | undefined) ?? s.section_key;
  return PRODUCT_FLAGS.find((f) => f.value === flag)?.label ?? "পণ্য সেকশন";
};

const emptySection = (order: number): HomepageSection => ({
  id: "new",
  section_key: "",
  title: "নতুন সেকশন",
  subtitle: "",
  is_visible: true,
  sort_order: order,
  product_limit: 8,
  config: { flag: "best_selling" },
});

function SectionsTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<HomepageSection | null>(null);
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "sections"],
    queryFn: async (): Promise<HomepageSection[]> => {
      const { data, error } = await supabase
        .from("homepage_sections")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as HomepageSection[];
    },
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin", "sections"] });
    void qc.invalidateQueries({ queryKey: ["homepage-sections"] });
  };

  const save = useMutation({
    mutationFn: async (s: HomepageSection) => {
      const flag = (s.config?.["flag"] as string | undefined) ?? "best_selling";
      const payload = {
        title: s.title,
        subtitle: s.subtitle,
        is_visible: s.is_visible,
        sort_order: Number(s.sort_order),
        product_limit: Number(s.product_limit),
        config: (s.config ?? {}) as never,
      };
      if (s.id === "new") {
        const { error } = await supabase.from("homepage_sections").insert({
          ...payload,
          section_key: `${flag}_${Date.now().toString(36)}`,
          config: { flag },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("homepage_sections")
          .update(payload)
          .eq("id", s.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("সেকশন সংরক্ষণ হয়েছে");
      setEditing(null);
      invalidate();
    },
    onError: () => toast.error("সংরক্ষণ করা যায়নি"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("homepage_sections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("সেকশন মুছে ফেলা হয়েছে");
      invalidate();
    },
    onError: () => toast.error("মুছে ফেলা যায়নি"),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const { error } = await supabase
        .from("homepage_sections")
        .update({ is_visible: value })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  if (isLoading) return <Skeleton className="h-64 w-full rounded-lg" />;

  const patch = (p: Partial<HomepageSection>) => setEditing((s) => (s ? { ...s, ...p } : s));
  const isProductSection = editing && !FIXED_KEYS.includes(editing.section_key);

  return (
    <div>
      <TableToolbar label="নতুন সেকশন" onAdd={() => setEditing(emptySection(data.length))} />
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>শিরোনাম</TableHead>
              <TableHead>ধরন</TableHead>
              <TableHead>ক্রম</TableHead>
              <TableHead>পণ্য সংখ্যা</TableHead>
              <TableHead>অবস্থা</TableHead>
              <TableHead className="text-right">কাজ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.title || s.section_key}</TableCell>
                <TableCell className="text-muted-foreground">{sectionTypeLabel(s)}</TableCell>
                <TableCell>{s.sort_order}</TableCell>
                <TableCell>{FIXED_KEYS.includes(s.section_key) ? "—" : s.product_limit}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={s.is_visible}
                      onCheckedChange={(v) => toggle.mutate({ id: s.id, value: v })}
                    />
                    <StatusBadge active={s.is_visible} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="outline" aria-label="সম্পাদনা" onClick={() => setEditing(s)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label="মুছে ফেলুন"
                      disabled={FIXED_KEYS.includes(s.section_key)}
                      onClick={() => remove.mutate(s.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing?.id === "new" ? "নতুন সেকশন" : "সেকশন সম্পাদনা"}</DialogTitle>
            <DialogDescription>হোমপেজে এই সেকশন কীভাবে দেখাবে তা নির্ধারণ করুন</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              {editing.id === "new" && (
                <div className="space-y-1.5">
                  <Label>সেকশনের ধরন</Label>
                  <Select
                    value={(editing.config?.["flag"] as string) ?? "best_selling"}
                    onValueChange={(v) => patch({ config: { ...editing.config, flag: v } })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_FLAGS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Field
                label="শিরোনাম"
                value={editing.title ?? ""}
                onChange={(v) => patch({ title: v })}
              />
              <Field
                label="সাব-শিরোনাম"
                value={editing.subtitle ?? ""}
                onChange={(v) => patch({ subtitle: v })}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="ক্রম"
                  type="number"
                  value={String(editing.sort_order)}
                  onChange={(v) => patch({ sort_order: Number(v || 0) })}
                />
                {(isProductSection || editing.id === "new") && (
                  <Field
                    label="পণ্য সংখ্যা"
                    type="number"
                    value={String(editing.product_limit)}
                    onChange={(v) => patch({ product_limit: Number(v || 0) })}
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editing.is_visible}
                  onCheckedChange={(v) => patch({ is_visible: v })}
                />
                <Label className="font-normal">হোমপেজে দেখাও</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              বাতিল
            </Button>
            <Button disabled={save.isPending} onClick={() => editing && save.mutate(editing)}>
              <Save className="size-4" /> সংরক্ষণ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
