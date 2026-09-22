import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Star, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/media";
import { cn } from "@/lib/utils";

export function ReviewForm({ productId }: { productId: string }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      setImageUrl(await uploadMedia(file, "reviews"));
      toast.success("ছবি যোগ হয়েছে");
    } catch {
      toast.error("ছবি আপলোড করা যায়নি");
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (!name.trim()) {
      toast.error("আপনার নাম লিখুন");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      reviewer_name: name.trim(),
      rating,
      comment: comment.trim() || null,
      image_url: imageUrl,
      is_approved: false,
    });
    setSaving(false);
    if (error) {
      toast.error("রিভিউ পাঠানো যায়নি");
      return;
    }
    setDone(true);
    setName("");
    setComment("");
    setImageUrl(null);
    setRating(5);
    void qc.invalidateQueries({ queryKey: ["reviews"] });
    toast.success("ধন্যবাদ! রিভিউটি অনুমোদনের পর দেখা যাবে");
  }

  if (done)
    return (
      <div className="max-w-2xl rounded-lg border border-border bg-surface p-4 text-sm text-muted-foreground">
        আপনার রিভিউ জমা হয়েছে। অনুমোদনের পর এটি এখানে দেখা যাবে।
      </div>
    );

  return (
    <div className="max-w-2xl space-y-3 rounded-lg border border-border bg-surface p-4">
      <h3 className="text-sm font-medium">রিভিউ দিন</h3>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" onClick={() => setRating(i)} aria-label={`${i} স্টার`}>
            <Star
              className={cn(
                "size-6",
                i <= rating ? "fill-secondary text-secondary" : "text-muted-foreground/40",
              )}
            />
          </button>
        ))}
      </div>
      <div className="space-y-1.5">
        <Label>আপনার নাম</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="নাম লিখুন" />
      </div>
      <div className="space-y-1.5">
        <Label>আপনার মন্তব্য</Label>
        <Textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="পণ্যটি সম্পর্কে আপনার অভিজ্ঞতা লিখুন"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          ছবি যোগ করুন
        </Button>
        {imageUrl && (
          <div className="relative size-16 overflow-hidden rounded-md border border-border">
            <img src={imageUrl} alt="" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => setImageUrl(null)}
              aria-label="ছবি সরান"
              className="absolute right-0.5 top-0.5 grid size-5 place-items-center rounded-full bg-foreground/70 text-background"
            >
              <X className="size-3" />
            </button>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
      <Button disabled={saving} onClick={() => void submit()}>
        {saving && <Loader2 className="size-4 animate-spin" />} রিভিউ পাঠান
      </Button>
    </div>
  );
}
