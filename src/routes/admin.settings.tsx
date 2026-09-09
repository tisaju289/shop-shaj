import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
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
import { settingsQuery } from "@/lib/store-context";
import { defaultSettings, type StoreSettings } from "@/lib/types";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(settingsQuery);
  const [form, setForm] = useState<StoreSettings>(defaultSettings);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("store_settings")
        .upsert({ id: "default", data: form as unknown as Record<string, unknown> });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("সেটিংস সংরক্ষণ হয়েছে");
      void qc.invalidateQueries({ queryKey: ["store-settings"] });
    },
    onError: () => toast.error("সংরক্ষণ করা যায়নি"),
  });

  if (isLoading) return <Skeleton className="h-96 w-full rounded-lg" />;

  const set = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const text = (key: keyof StoreSettings, label: string, placeholder?: string) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        value={String(form[key] ?? "")}
        placeholder={placeholder}
        onChange={(e) => set(key, e.target.value as never)}
      />
    </div>
  );

  const number = (key: keyof StoreSettings, label: string) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type="number"
        value={String(form[key] ?? 0)}
        onChange={(e) => set(key, Number(e.target.value || 0) as never)}
      />
    </div>
  );

  const area = (key: keyof StoreSettings, label: string, rows = 5) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Textarea
        rows={rows}
        value={String(form[key] ?? "")}
        onChange={(e) => set(key, e.target.value as never)}
      />
    </div>
  );

  return (
    <div>
      <AdminHeading
        title="স্টোর সেটিংস"
        description="স্টোরের নাম, যোগাযোগ, ডেলিভারি, ডিজাইন ও নীতিমালা"
        action={
          <Button disabled={save.isPending} onClick={() => save.mutate()}>
            <Save className="size-4" /> সংরক্ষণ করুন
          </Button>
        }
      />

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general">সাধারণ</TabsTrigger>
          <TabsTrigger value="contact">যোগাযোগ</TabsTrigger>
          <TabsTrigger value="delivery">ডেলিভারি</TabsTrigger>
          <TabsTrigger value="design">ডিজাইন</TabsTrigger>
          <TabsTrigger value="seo">এসইও</TabsTrigger>
          <TabsTrigger value="policy">নীতিমালা</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="pt-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">স্টোরের পরিচিতি</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {text("store_name", "স্টোরের নাম")}
              {text("tagline", "ট্যাগলাইন")}
              {text("currency", "মুদ্রার চিহ্ন")}
              {text("footer_text", "ফুটারের বর্ণনা")}
              {text("copyright_text", "কপিরাইট লেখা")}
              <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
                <MediaInput
                  label="লোগো"
                  folder="store"
                  value={form.logo_url || null}
                  onChange={(url) => set("logo_url", url ?? "")}
                />
                <MediaInput
                  label="ফেভিকন"
                  folder="store"
                  value={form.favicon_url || null}
                  onChange={(url) => set("favicon_url", url ?? "")}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="pt-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">যোগাযোগ ও সোশ্যাল মিডিয়া</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {text("phone", "ফোন নম্বর")}
              {text("whatsapp", "হোয়াটসঅ্যাপ নম্বর")}
              {text("email", "ইমেইল")}
              {text("address", "ঠিকানা")}
              {text("facebook_url", "ফেসবুক লিংক")}
              {text("instagram_url", "ইনস্টাগ্রাম লিংক")}
              {text("tiktok_url", "টিকটক লিংক")}
              {text("youtube_url", "ইউটিউব লিংক")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="pt-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ডেলিভারি ও পেমেন্ট</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {number("delivery_charge_inside", "ঢাকার ভিতরে ডেলিভারি চার্জ")}
              {number("delivery_charge_outside", "ঢাকার বাইরে ডেলিভারি চার্জ")}
              {number("free_delivery_threshold", "ফ্রি ডেলিভারির সর্বনিম্ন মূল্য (০ = বন্ধ)")}
              {number("min_order_amount", "সর্বনিম্ন অর্ডার মূল্য")}
              <div className="flex items-center justify-between gap-3 rounded-md border border-border p-3 md:col-span-2">
                <Label className="font-normal">ক্যাশ অন ডেলিভারি চালু</Label>
                <Switch
                  checked={form.cod_enabled}
                  onCheckedChange={(v) => set("cod_enabled", v)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design" className="pt-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">রঙ ও ডিজাইন</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>প্রধান রঙ</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    className="w-16 p-1"
                    value={form.primary_color || "#7a2b3f"}
                    onChange={(e) => set("primary_color", e.target.value)}
                  />
                  <Input
                    value={form.primary_color}
                    placeholder="#7a2b3f"
                    onChange={(e) => set("primary_color", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>দ্বিতীয় রঙ</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    className="w-16 p-1"
                    value={form.secondary_color || "#c9a227"}
                    onChange={(e) => set("secondary_color", e.target.value)}
                  />
                  <Input
                    value={form.secondary_color}
                    placeholder="#c9a227"
                    onChange={(e) => set("secondary_color", e.target.value)}
                  />
                </div>
              </div>
              {text("radius", "কোণার গোলাকৃতি (যেমন 0.5rem)")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="pt-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">এসইও তথ্য</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {text("meta_title", "মেটা টাইটেল")}
              {area("meta_description", "মেটা বিবরণ", 3)}
              {text("google_verification", "গুগল ভেরিফিকেশন কোড")}
              <MediaInput
                label="শেয়ারের ছবি (OG image)"
                folder="store"
                value={form.og_image || null}
                onChange={(url) => set("og_image", url ?? "")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policy" className="pt-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">নীতিমালা ও পরিচিতি</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {area("about_text", "আমাদের সম্পর্কে")}
              {area("return_policy", "রিটার্ন ও এক্সচেঞ্জ নীতি")}
              {area("privacy_policy", "প্রাইভেসি পলিসি")}
              {area("terms", "শর্তাবলি")}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Button disabled={save.isPending} onClick={() => save.mutate()}>
          <Save className="size-4" /> সংরক্ষণ করুন
        </Button>
      </div>
    </div>
  );
}
