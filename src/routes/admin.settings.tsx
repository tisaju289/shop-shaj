import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUp, Eye, EyeOff, Plus, Save, Trash2 } from "lucide-react";
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
import { getCapiTokenStatus, removeCapiToken, saveCapiToken } from "@/lib/tracking.functions";
import { defaultSettings, type NavLinkItem, type StoreSettings } from "@/lib/types";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(settingsQuery);
  const [form, setForm] = useState<StoreSettings>(defaultSettings);
  const [capiToken, setCapiToken] = useState("");
  const [showCapiToken, setShowCapiToken] = useState(false);
  const { data: capiStatus, refetch: refetchCapiStatus } = useQuery({
    queryKey: ["capi-token-status"],
    queryFn: () => getCapiTokenStatus(),
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("store_settings")
        .upsert({ id: "default", data: JSON.parse(JSON.stringify(form)) });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("সেটিংস সংরক্ষণ হয়েছে");
      void qc.invalidateQueries({ queryKey: ["store-settings"] });
    },
    onError: () => toast.error("সংরক্ষণ করা যায়নি"),
  });

  const saveToken = useMutation({
    mutationFn: () => saveCapiToken({ data: { token: capiToken } }),
    onSuccess: () => {
      setCapiToken("");
      void refetchCapiStatus();
      toast.success("CAPI token নিরাপদে সংরক্ষণ হয়েছে");
    },
    onError: () => toast.error("CAPI token সংরক্ষণ করা যায়নি"),
  });

  const removeToken = useMutation({
    mutationFn: () => removeCapiToken(),
    onSuccess: () => {
      void refetchCapiStatus();
      toast.success("CAPI token সরানো হয়েছে");
    },
    onError: () => toast.error("CAPI token সরানো যায়নি"),
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
          <TabsTrigger value="headerfooter">হেডার ও ফুটার</TabsTrigger>
          <TabsTrigger value="contact">যোগাযোগ</TabsTrigger>
          <TabsTrigger value="delivery">ডেলিভারি</TabsTrigger>
          <TabsTrigger value="design">ডিজাইন</TabsTrigger>
          <TabsTrigger value="seo">এসইও</TabsTrigger>
          <TabsTrigger value="tracking">ট্র্যাকিং</TabsTrigger>
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
                  hint="প্রস্তাবিত অনুপাত ৩:১ — ৩০০×১০০ পিক্সেল (PNG, ট্রান্সপারেন্ট)"
                  folder="store"
                  value={form.logo_url || null}
                  onChange={(url) => set("logo_url", url ?? "")}
                />
                <MediaInput
                  label="ফেভিকন"
                  hint="প্রস্তাবিত অনুপাত ১:১ — ৫১২×৫১২ পিক্সেল"
                  folder="store"
                  value={form.favicon_url || null}
                  onChange={(url) => set("favicon_url", url ?? "")}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="headerfooter" className="pt-5">
          <div className="grid gap-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">হেডার</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <ToggleRow
                    label="উপরের ঘোষণা বার দেখান"
                    checked={form.header_announcement_enabled !== false}
                    onChange={(v) => set("header_announcement_enabled", v)}
                  />
                  <ToggleRow
                    label="হেডার স্ক্রলে আটকে থাকবে"
                    checked={form.header_sticky !== false}
                    onChange={(v) => set("header_sticky", v)}
                  />
                  <ToggleRow
                    label="সার্চ বাটন দেখান"
                    checked={form.header_show_search !== false}
                    onChange={(v) => set("header_show_search", v)}
                  />
                  <ToggleRow
                    label="উইশলিস্ট বাটন দেখান"
                    checked={form.header_show_wishlist !== false}
                    onChange={(v) => set("header_show_wishlist", v)}
                  />
                </div>
                {text("header_announcement_text", "ঘোষণার লেখা")}
                <div className="grid gap-4 md:grid-cols-2">
                  <ColorField
                    label="হেডারের ব্যাকগ্রাউন্ড রঙ"
                    value={form.header_bg_color ?? ""}
                    fallback="#ffffff"
                    onChange={(v) => set("header_bg_color", v)}
                  />
                  <ColorField
                    label="হেডারের লেখার রঙ"
                    value={form.header_text_color ?? ""}
                    fallback="#7a2b3f"
                    onChange={(v) => set("header_text_color", v)}
                  />
                  <ColorField
                    label="ঘোষণা বারের ব্যাকগ্রাউন্ড রঙ"
                    value={form.header_announcement_bg_color ?? ""}
                    fallback="#7a2b3f"
                    onChange={(v) => set("header_announcement_bg_color", v)}
                  />
                  <ColorField
                    label="ঘোষণা বারের লেখার রঙ"
                    value={form.header_announcement_text_color ?? ""}
                    fallback="#ffffff"
                    onChange={(v) => set("header_announcement_text_color", v)}
                  />
                </div>
                <LinkListEditor
                  title="মেনু (নেভিগেশন) লিংক"
                  items={form.header_nav ?? []}
                  onChange={(items) => set("header_nav", items)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">ফুটার</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {text("footer_text", "ফুটারের বর্ণনা")}
                  {text("copyright_text", "কপিরাইট লেখা")}
                  {text("footer_payment_text", "পেমেন্ট সংক্রান্ত লেখা")}
                  {text("footer_contact_title", "যোগাযোগ কলামের শিরোনাম")}
                  {text("footer_categories_title", "ক্যাটাগরি কলামের শিরোনাম")}
                  <div />
                  <ToggleRow
                    label="ক্যাটাগরি কলাম দেখান"
                    checked={form.footer_show_categories !== false}
                    onChange={(v) => set("footer_show_categories", v)}
                  />
                  <ToggleRow
                    label="সোশ্যাল আইকন দেখান"
                    checked={form.footer_show_social !== false}
                    onChange={(v) => set("footer_show_social", v)}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <ColorField
                    label="ফুটারের ব্যাকগ্রাউন্ড রঙ"
                    value={form.footer_bg_color ?? ""}
                    fallback="#f4efe9"
                    onChange={(v) => set("footer_bg_color", v)}
                  />
                  <ColorField
                    label="ফুটারের লেখার রঙ"
                    value={form.footer_text_color ?? ""}
                    fallback="#3a2b2b"
                    onChange={(v) => set("footer_text_color", v)}
                  />
                </div>
                {text("footer_quick_links_title", "দ্রুত লিংক কলামের শিরোনাম")}
                <LinkListEditor
                  title="দ্রুত লিংক"
                  items={form.footer_quick_links ?? []}
                  onChange={(items) => set("footer_quick_links", items)}
                />
                {text("footer_service_links_title", "কাস্টমার সার্ভিস কলামের শিরোনাম")}
                <LinkListEditor
                  title="কাস্টমার সার্ভিস লিংক"
                  items={form.footer_service_links ?? []}
                  onChange={(items) => set("footer_service_links", items)}
                />
              </CardContent>
            </Card>
          </div>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">WhatsApp ফ্লোটিং বাটন</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
                <Label className="font-normal">ফ্লোটিং বাটন চালু করুন</Label>
                <Switch
                  checked={form.whatsapp_float_enabled}
                  onCheckedChange={(v) => set("whatsapp_float_enabled", v)}
                />
              </div>
              {form.whatsapp_float_enabled && (
                <>
                  <div className="space-y-1.5">
                    <Label>ডিফল্ট মেসেজ</Label>
                    <Textarea
                      value={form.whatsapp_float_message ?? ""}
                      placeholder="যেমন: আমরা সাহায্য করতে প্রস্তুত!"
                      onChange={(e) => set("whatsapp_float_message", e.target.value)}
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground">
                      বাটনে ক্লিক করলে এই মেসেজটি WhatsApp-এ অটো লেখা হবে।
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>বাটনের অবস্থান</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={form.whatsapp_float_position === "left" ? "default" : "outline"}
                        onClick={() => set("whatsapp_float_position", "left")}
                      >
                        বাম
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={form.whatsapp_float_position === "right" ? "default" : "outline"}
                        onClick={() => set("whatsapp_float_position", "right")}
                      >
                        ডান
                      </Button>
                    </div>
                  </div>
                  <p className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                    ফ্লোটিং বাটনে উপরের “হোয়াটসঅ্যাপ নম্বর” ব্যবহৃত হবে। নম্বর দেওয়া না থাকলে বাটন দেখাবে না।
                  </p>
                </>
              )}
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
                hint="প্রস্তাবিত অনুপাত ১.৯১:১ — ১২০০×৬৩০ পিক্সেল"
                folder="store"
                value={form.og_image || null}
                onChange={(url) => set("og_image", url ?? "")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="pt-5">
          <div className="grid gap-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Facebook Pixel ও Conversions API</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <ToggleRow
                    label="Facebook Pixel চালু"
                    checked={form.facebook_pixel_enabled}
                    onChange={(v) => set("facebook_pixel_enabled", v)}
                  />
                  <ToggleRow
                    label="Conversions API (CAPI) চালু"
                    checked={form.facebook_capi_enabled}
                    onChange={(v) => set("facebook_capi_enabled", v)}
                  />
                </div>
                {text("facebook_pixel_id", "Pixel ID", "যেমন 123456789012345")}
                {text("facebook_test_event_code", "Test event code (ঐচ্ছিক)", "পরীক্ষা শেষে খালি রাখুন")}
                <div className="space-y-1.5">
                  <Label>Conversions API access token</Label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative flex-1">
                      <Input
                        type={showCapiToken ? "text" : "password"}
                        value={capiToken}
                        placeholder={capiStatus?.configured ? "•••••••••••••••• (সংরক্ষিত)" : "Meta Events Manager থেকে token দিন"}
                        onChange={(e) => setCapiToken(e.target.value)}
                        className="pr-10"
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0"
                        aria-label={showCapiToken ? "Token লুকান" : "Token দেখুন"}
                        onClick={() => setShowCapiToken((value) => !value)}
                      >
                        {showCapiToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                    </div>
                    <Button type="button" variant="outline" disabled={saveToken.isPending || capiToken.trim().length < 20} onClick={() => saveToken.mutate()}>
                      Token সংরক্ষণ
                    </Button>
                    {capiStatus?.configured && (
                      <Button type="button" variant="ghost" disabled={removeToken.isPending} onClick={() => removeToken.mutate()}>
                        Token সরান
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Token গোপন রাখা হয় এবং সংরক্ষণের পর আর দেখানো হয় না। Purchase event-এ কোনো নাম, ফোন বা ইমেইল পাঠানো হয় না।</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Google Analytics 4</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <ToggleRow
                  label="GA4 চালু"
                  checked={form.ga4_enabled}
                  onChange={(v) => set("ga4_enabled", v)}
                />
                {text("ga4_measurement_id", "Measurement ID", "যেমন G-XXXXXXXXXX")}
              </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground">সেটিংস সংরক্ষণ করলে page view এবং সফল অর্ডার মাপা শুরু হবে। নিয়ন্ত্রিত বা অঞ্চল শনাক্ত করা যায়নি—এমন দর্শকদের tracking পাঠানো হবে না।</p>
          </div>
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

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
      <Label className="font-normal">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function ColorField({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value: string;
  fallback: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          type="color"
          className="w-16 p-1"
          value={value || fallback}
          onChange={(e) => onChange(e.target.value)}
        />
        <Input
          value={value}
          placeholder={`${fallback} (খালি রাখলে ডিফল্ট)`}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <Button type="button" variant="outline" onClick={() => onChange("")}>
            রিসেট
          </Button>
        )}
      </div>
    </div>
  );
}

function LinkListEditor({
  title,
  items,
  onChange,
}: {
  title: string;
  items: NavLinkItem[];
  onChange: (items: NavLinkItem[]) => void;
}) {
  const update = (index: number, patch: Partial<NavLinkItem>) =>
    onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));

  return (
    <div className="rounded-md border border-border p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Label>{title}</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onChange([...items, { label: "", url: "/" }])}
        >
          <Plus className="size-4" /> নতুন লিংক
        </Button>
      </div>
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">কোনো লিংক নেই।</p>
      )}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={item.label}
              placeholder="লেখা (যেমন শপ)"
              onChange={(e) => update(i, { label: e.target.value })}
            />
            <Input
              value={item.url}
              placeholder="লিংক (যেমন /shop)"
              onChange={(e) => update(i, { url: e.target.value })}
            />
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="উপরে"
                disabled={i === 0}
                onClick={() => {
                  const next = [...items];
                  const prev = next[i - 1]!;
                  next[i - 1] = next[i]!;
                  next[i] = prev;
                  onChange(next);
                }}
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="মুছুন"
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
