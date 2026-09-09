import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminHeading } from "@/components/admin/AdminShell";
import { MediaInput } from "@/components/admin/MediaInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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

/* ---------------- Hero slides ---------------- */

function HeroTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "hero-slides"],
    queryFn: async (): Promise<HeroSlide[]> => {
      const { data, error } = await supabase.from("hero_slides").select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as HeroSlide[];
    },
  });
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  useEffect(() => {
    if (data) setSlides(data);
  }, [data]);

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
      const { error } = slide.id.startsWith("new-")
        ? await supabase.from("hero_slides").insert(payload)
        : await supabase.from("hero_slides").update(payload).eq("id", slide.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("স্লাইড সংরক্ষণ হয়েছে");
      void qc.invalidateQueries({ queryKey: ["admin", "hero-slides"] });
      void qc.invalidateQueries({ queryKey: ["hero-slides"] });
    },
    onError: () => toast.error("সংরক্ষণ করা যায়নি"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (id.startsWith("new-")) return;
      const { error } = await supabase.from("hero_slides").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("স্লাইড মুছে ফেলা হয়েছে");
      void qc.invalidateQueries({ queryKey: ["admin", "hero-slides"] });
      void qc.invalidateQueries({ queryKey: ["hero-slides"] });
    },
  });

  if (isLoading) return <Skeleton className="h-64 w-full rounded-lg" />;

  const update = (id: string, patch: Partial<HeroSlide>) =>
    setSlides((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  return (
    <div className="space-y-5">
      <Button
        variant="outline"
        onClick={() =>
          setSlides((list) => [
            ...list,
            {
              id: `new-${Date.now()}`,
              subtitle: "",
              heading: "নতুন স্লাইড",
              description: "",
              cta_text: "শপিং করুন",
              cta_url: "/shop",
              secondary_cta_text: "",
              secondary_cta_url: "",
              image_url: null,
              mobile_image_url: null,
              overlay_opacity: 0.35,
              is_active: true,
              sort_order: list.length,
            },
          ])
        }
      >
        <Plus className="size-4" /> নতুন স্লাইড
      </Button>

      {slides.map((s) => (
        <Card key={s.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{s.heading || "স্লাইড"}</CardTitle>
            <div className="flex items-center gap-2">
              <Switch
                checked={s.is_active}
                onCheckedChange={(v) => update(s.id, { is_active: v })}
              />
              <Button size="sm" onClick={() => save.mutate(s)}>
                <Save className="size-4" /> সংরক্ষণ
              </Button>
              <Button
                size="icon"
                variant="outline"
                aria-label="মুছে ফেলুন"
                onClick={() => {
                  setSlides((list) => list.filter((x) => x.id !== s.id));
                  remove.mutate(s.id);
                }}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <Field label="উপরের ছোট লেখা" value={s.subtitle ?? ""} onChange={(v) => update(s.id, { subtitle: v })} />
              <Field label="প্রধান শিরোনাম" value={s.heading} onChange={(v) => update(s.id, { heading: v })} />
              <div className="space-y-1.5">
                <Label>বিবরণ</Label>
                <Textarea
                  rows={3}
                  value={s.description ?? ""}
                  onChange={(e) => update(s.id, { description: e.target.value })}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="বাটনের লেখা" value={s.cta_text ?? ""} onChange={(v) => update(s.id, { cta_text: v })} />
                <Field label="বাটনের লিংক" value={s.cta_url ?? ""} onChange={(v) => update(s.id, { cta_url: v })} />
                <Field
                  label="দ্বিতীয় বাটনের লেখা"
                  value={s.secondary_cta_text ?? ""}
                  onChange={(v) => update(s.id, { secondary_cta_text: v })}
                />
                <Field
                  label="দ্বিতীয় বাটনের লিংক"
                  value={s.secondary_cta_url ?? ""}
                  onChange={(v) => update(s.id, { secondary_cta_url: v })}
                />
                <Field
                  label="ক্রম"
                  value={String(s.sort_order)}
                  onChange={(v) => update(s.id, { sort_order: Number(v || 0) })}
                />
                <Field
                  label="ছবির উপর ছায়া (০-১)"
                  value={String(s.overlay_opacity)}
                  onChange={(v) => update(s.id, { overlay_opacity: Number(v || 0) })}
                />
              </div>
            </div>
            <div className="space-y-4">
              <MediaInput
                label="ডেস্কটপ ছবি"
                folder="hero"
                value={s.image_url}
                onChange={(url) => update(s.id, { image_url: url })}
              />
              <MediaInput
                label="মোবাইল ছবি"
                folder="hero"
                value={s.mobile_image_url}
                onChange={(url) => update(s.id, { mobile_image_url: url })}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ---------------- Promo banners ---------------- */

function BannerTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
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
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  useEffect(() => {
    if (data) setBanners(data);
  }, [data]);

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
      const { error } = b.id.startsWith("new-")
        ? await supabase.from("promotional_banners").insert(payload)
        : await supabase.from("promotional_banners").update(payload).eq("id", b.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("ব্যানার সংরক্ষণ হয়েছে");
      void qc.invalidateQueries({ queryKey: ["admin", "banners"] });
      void qc.invalidateQueries({ queryKey: ["promo-banners"] });
    },
    onError: () => toast.error("সংরক্ষণ করা যায়নি"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (id.startsWith("new-")) return;
      const { error } = await supabase.from("promotional_banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "banners"] });
      void qc.invalidateQueries({ queryKey: ["promo-banners"] });
    },
  });

  if (isLoading) return <Skeleton className="h-64 w-full rounded-lg" />;

  const update = (id: string, patch: Partial<PromoBanner>) =>
    setBanners((list) => list.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  return (
    <div className="space-y-5">
      <Button
        variant="outline"
        onClick={() =>
          setBanners((list) => [
            ...list,
            {
              id: `new-${Date.now()}`,
              title: "নতুন ব্যানার",
              subtitle: "",
              image_url: null,
              mobile_image_url: null,
              cta_text: "দেখুন",
              cta_url: "/offers",
              starts_at: null,
              ends_at: null,
              is_active: true,
              sort_order: list.length,
            },
          ])
        }
      >
        <Plus className="size-4" /> নতুন ব্যানার
      </Button>

      {banners.map((b) => (
        <Card key={b.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{b.title || "ব্যানার"}</CardTitle>
            <div className="flex items-center gap-2">
              <Switch checked={b.is_active} onCheckedChange={(v) => update(b.id, { is_active: v })} />
              <Button size="sm" onClick={() => save.mutate(b)}>
                <Save className="size-4" /> সংরক্ষণ
              </Button>
              <Button
                size="icon"
                variant="outline"
                aria-label="মুছে ফেলুন"
                onClick={() => {
                  setBanners((list) => list.filter((x) => x.id !== b.id));
                  remove.mutate(b.id);
                }}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <Field label="শিরোনাম" value={b.title ?? ""} onChange={(v) => update(b.id, { title: v })} />
              <Field label="সাব-শিরোনাম" value={b.subtitle ?? ""} onChange={(v) => update(b.id, { subtitle: v })} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="বাটনের লেখা" value={b.cta_text ?? ""} onChange={(v) => update(b.id, { cta_text: v })} />
                <Field label="বাটনের লিংক" value={b.cta_url ?? ""} onChange={(v) => update(b.id, { cta_url: v })} />
                <div className="space-y-1.5">
                  <Label>শুরুর তারিখ</Label>
                  <Input
                    type="date"
                    value={b.starts_at ? b.starts_at.slice(0, 10) : ""}
                    onChange={(e) =>
                      update(b.id, {
                        starts_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>শেষ তারিখ</Label>
                  <Input
                    type="date"
                    value={b.ends_at ? b.ends_at.slice(0, 10) : ""}
                    onChange={(e) =>
                      update(b.id, {
                        ends_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                      })
                    }
                  />
                </div>
                <Field
                  label="ক্রম"
                  value={String(b.sort_order)}
                  onChange={(v) => update(b.id, { sort_order: Number(v || 0) })}
                />
              </div>
            </div>
            <div className="space-y-4">
              <MediaInput
                label="ডেস্কটপ ছবি"
                folder="banners"
                value={b.image_url}
                onChange={(url) => update(b.id, { image_url: url })}
              />
              <MediaInput
                label="মোবাইল ছবি"
                folder="banners"
                value={b.mobile_image_url}
                onChange={(url) => update(b.id, { mobile_image_url: url })}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ---------------- Homepage sections ---------------- */

function SectionsTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
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
  const [sections, setSections] = useState<HomepageSection[]>([]);
  useEffect(() => {
    if (data) setSections(data);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      for (const s of sections) {
        const { error } = await supabase
          .from("homepage_sections")
          .update({
            title: s.title,
            subtitle: s.subtitle,
            is_visible: s.is_visible,
            sort_order: Number(s.sort_order),
            product_limit: Number(s.product_limit),
          })
          .eq("id", s.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("হোমপেজ সেকশন সংরক্ষণ হয়েছে");
      void qc.invalidateQueries({ queryKey: ["admin", "sections"] });
      void qc.invalidateQueries({ queryKey: ["homepage-sections"] });
    },
    onError: () => toast.error("সংরক্ষণ করা যায়নি"),
  });

  if (isLoading) return <Skeleton className="h-64 w-full rounded-lg" />;

  const update = (id: string, patch: Partial<HomepageSection>) =>
    setSections((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  return (
    <div className="space-y-4">
      {sections.map((s) => (
        <Card key={s.id}>
          <CardContent className="grid gap-4 p-5 md:grid-cols-4">
            <div className="space-y-1.5">
              <Label>সেকশন</Label>
              <Input value={s.section_key} readOnly className="bg-surface" />
            </div>
            <Field label="শিরোনাম" value={s.title ?? ""} onChange={(v) => update(s.id, { title: v })} />
            <Field
              label="সাব-শিরোনাম"
              value={s.subtitle ?? ""}
              onChange={(v) => update(s.id, { subtitle: v })}
            />
            <div className="grid grid-cols-3 items-end gap-3">
              <div className="space-y-1.5">
                <Label>ক্রম</Label>
                <Input
                  type="number"
                  value={s.sort_order}
                  onChange={(e) => update(s.id, { sort_order: Number(e.target.value || 0) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>পণ্য সংখ্যা</Label>
                <Input
                  type="number"
                  value={s.product_limit}
                  onChange={(e) => update(s.id, { product_limit: Number(e.target.value || 0) })}
                />
              </div>
              <div className="flex items-center gap-2 pb-2">
                <Switch
                  checked={s.is_visible}
                  onCheckedChange={(v) => update(s.id, { is_visible: v })}
                />
                <Label className="font-normal">দেখাও</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button disabled={save.isPending} onClick={() => save.mutate()}>
        <Save className="size-4" /> সব সংরক্ষণ করুন
      </Button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
