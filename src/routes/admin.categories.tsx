import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdminHeading } from "@/components/admin/AdminShell";
import { MediaInput } from "@/components/admin/MediaInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Category } from "@/lib/types";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategoriesPage,
});

type Draft = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string;
  image_url: string | null;
  banner_url: string | null;
  is_active: boolean;
  sort_order: string;
};

const emptyDraft: Draft = {
  name: "",
  slug: "",
  description: "",
  parent_id: "none",
  image_url: null,
  banner_url: null,
  is_active: true,
  sort_order: "0",
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as Category[];
    },
  });

  const save = useMutation({
    mutationFn: async (item: Draft) => {
      const payload = {
        name: item.name.trim(),
        slug: item.slug.trim() || slugify(item.name),
        description: item.description.trim() || null,
        parent_id: item.parent_id === "none" ? null : item.parent_id,
        image_url: item.image_url,
        banner_url: item.banner_url,
        is_active: item.is_active,
        sort_order: Number(item.sort_order || 0),
      };
      if (!payload.name) throw new Error("ক্যাটাগরির নাম দিতে হবে");
      const { error } = item.id
        ? await supabase.from("categories").update(payload).eq("id", item.id)
        : await supabase.from("categories").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("ক্যাটাগরি সংরক্ষণ হয়েছে");
      setDraft(null);
      void qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      void qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "সংরক্ষণ করা যায়নি"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("ক্যাটাগরি মুছে ফেলা হয়েছে");
      void qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      void qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => toast.error("মুছে ফেলা যায়নি — এই ক্যাটাগরিতে পণ্য থাকতে পারে"),
  });

  return (
    <div>
      <AdminHeading
        title="ক্যাটাগরি ব্যবস্থাপনা"
        description="ক্যাটাগরি ও সাব-ক্যাটাগরি সাজান"
        action={
          <Button onClick={() => setDraft(emptyDraft)}>
            <Plus className="size-4" /> নতুন ক্যাটাগরি
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>নাম</TableHead>
                <TableHead>প্যারেন্ট</TableHead>
                <TableHead>ক্রম</TableHead>
                <TableHead>সক্রিয়</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {c.image_url && (
                        <img src={c.image_url} alt="" className="size-10 rounded-md object-cover" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {categories.find((p) => p.id === c.parent_id)?.name ?? "—"}
                  </TableCell>
                  <TableCell>{c.sort_order}</TableCell>
                  <TableCell>{c.is_active ? "হ্যাঁ" : "না"}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="সম্পাদনা"
                        onClick={() =>
                          setDraft({
                            id: c.id,
                            name: c.name,
                            slug: c.slug,
                            description: c.description ?? "",
                            parent_id: c.parent_id ?? "none",
                            image_url: c.image_url,
                            banner_url: c.banner_url,
                            is_active: c.is_active,
                            sort_order: String(c.sort_order),
                          })
                        }
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="মুছে ফেলুন"
                        onClick={() => remove.mutate(c.id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!categories.length && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    কোনো ক্যাটাগরি নেই।
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!draft} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "ক্যাটাগরি সম্পাদনা" : "নতুন ক্যাটাগরি"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>নাম *</Label>
                <Input
                  value={draft.name}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      name: e.target.value,
                      slug: draft.slug || slugify(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>ইউআরএল (slug)</Label>
                <Input
                  value={draft.slug}
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>বিবরণ</Label>
                <Textarea
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>প্যারেন্ট ক্যাটাগরি</Label>
                <Select
                  value={draft.parent_id}
                  onValueChange={(value) => setDraft({ ...draft, parent_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">কোনোটি নয়</SelectItem>
                    {categories
                      .filter((c) => c.id !== draft.id)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <MediaInput
                label="ক্যাটাগরির ছবি"
                folder="categories"
                value={draft.image_url}
                onChange={(url) => setDraft({ ...draft, image_url: url })}
              />
              <MediaInput
                label="ব্যানার ছবি"
                folder="categories"
                value={draft.banner_url}
                onChange={(url) => setDraft({ ...draft, banner_url: url })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>ক্রম</Label>
                  <Input
                    type="number"
                    value={draft.sort_order}
                    onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 pt-6">
                  <Label className="font-normal">সক্রিয়</Label>
                  <Switch
                    checked={draft.is_active}
                    onCheckedChange={(v) => setDraft({ ...draft, is_active: v })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>
              বাতিল
            </Button>
            <Button
              disabled={save.isPending}
              onClick={() => draft && save.mutate(draft)}
            >
              সংরক্ষণ করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
