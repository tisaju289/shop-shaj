import { Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadMedia, type MediaFolder } from "@/lib/media";

export function MediaInput({
  label,
  value,
  folder,
  onChange,
}: {
  label: string;
  value: string | null;
  folder: MediaFolder;
  onChange: (url: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const url = await uploadMedia(file, folder);
      onChange(url);
      toast.success("ছবি আপলোড হয়েছে");
    } catch {
      toast.error("ছবি আপলোড করা যায়নি");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-start gap-3">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-md border border-border bg-surface">
          {value ? (
            <>
              <img src={value} alt="" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(null)}
                className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-foreground/70 text-background"
                aria-label="ছবি সরান"
              >
                <X className="size-3.5" />
              </button>
            </>
          ) : (
            <div className="grid size-full place-items-center text-xs text-muted-foreground">
              নেই
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            ছবি আপলোড করুন
          </Button>
          <Input
            placeholder="অথবা ছবির লিংক দিন"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value || null)}
          />
        </div>
      </div>
      <input
        ref={inputRef}
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
  );
}
