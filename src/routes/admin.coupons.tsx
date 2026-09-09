import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdminHeading } from "@/components/admin/AdminShell";
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
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/format";
import type { Coupon } from "@/lib/types";

export const Route = createFileRoute("/admin/coupons")({
  component: AdminCouponsPage,
});

type Draft = {
  id?: string;
  code: string;
  discount_type: string;
  discount_value: string;
  min_order_amount: string;
  max_discount: string;
  usage_limit: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
};

const emptyDraft: Draft = {
  code: "",
  discount_type: "percentage",
  discount_value: "10",
  min_order_amount: "0",
  max_discount: "",
  usage_limit: "",
  starts_at: "",
  expires_at: "",
  is_active: true,
};

function AdminCouponsPage() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: async (): Promise<Coupon[]> => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Coupon[];
    },
  });

  const save = useMutation({
    mutationFn: async (item: Draft) => {
      if (!item.code.trim()) throw new Error("কুপন কোড দিতে হবে");
      const payload = {
        code: item.code.trim(),
        discount_type: item.discount_type,
        discount_value: Number(item.discount_value || 0),
        min_order_amount: Number(item.min_order_amount || 0),
        max_discount: item.max_discount ? Number(item.max_discount) : null,
        usage_limit: item.usage_limit ? Number(item.usage_limit) : null,
        starts_at: item.starts_at ? new Date(item.starts_at).toISOString() : null,
        expires_at: item.expires_at ? new Date(item.expires_at).toISOString() : null,
        is_active: item.is_active,
      };
      const { error } = item.id
        ? await supabase.from("coupons").update(payload).eq("id", item.id)
        : await supabase.from("coupons").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("কুপন সংরক্ষণ হয়েছে");
      setDraft(null);
      void qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "সংরক্ষণ করা যায়নি"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("কুপন মুছে ফেলা হয়েছে");
      void qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
    onError: () => toast.error("মুছে ফেলা যায়নি"),
  });

  return (
    <div>
      <AdminHeading
        title="কুপন ব্যবস্থাপনা"
        description="ডিসকাউন্ট কুপন তৈরি ও নিয়ন্ত্রণ করুন"
        action={
          <Button onClick={() => setDraft(emptyDraft)}>
            <Plus className="size-4" /> নতুন কুপন
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
                <TableHead>কোড</TableHead>
                <TableHead>ছাড়</TableHead>
                <TableHead>সর্বনিম্ন অর্ডার</TableHead>
                <TableHead>ব্যবহার</TableHead>
                <TableHead>মেয়াদ</TableHead>
                <TableHead>সক্রিয়</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.code}</TableCell>
                  <TableCell>
                    {c.discount_type === "percentage"
                      ? `${c.discount_value}%`
                      : `${c.discount_value} টাকা`}
                  </TableCell>
                  <TableCell>{c.min_order_amount}</TableCell>
                  <TableCell>
                    {c.used_count}
                    {c.usage_limit ? ` / ${c.usage_limit}` : ""}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.expires_at ? formatDate(c.expires_at) : "সীমাহীন"}
                  </TableCell>
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
                            code: c.code,
                            discount_type: c.discount_type,
                            discount_value: String(c.discount_value),
                            min_order_amount: String(c.min_order_amount),
                            max_discount: c.max_discount ? String(c.max_discount) : "",
                            usage_limit: c.usage_limit ? String(c.usage_limit) : "",
                            starts_at: c.starts_at ? c.starts_at.slice(0, 10) : "",
                            expires_at: c.expires_at ? c.expires_at.slice(0, 10) : "",
                            is_active: c.is_active,
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
              {!coupons.length && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    কোনো কুপন নেই।
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
            <DialogTitle>{draft?.id ? "কুপন সম্পাদনা" : "নতুন কুপন"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>কুপন কোড *</Label>
                <Input
                  value={draft.code}
                  onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>ছাড়ের ধরন</Label>
                  <Select
                    value={draft.discount_type}
                    onValueChange={(value) => setDraft({ ...draft, discount_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">শতকরা (%)</SelectItem>
                      <SelectItem value="fixed">নির্দিষ্ট টাকা</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>ছাড়ের পরিমাণ</Label>
                  <Input
                    type="number"
                    value={draft.discount_value}
                    onChange={(e) => setDraft({ ...draft, discount_value: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>সর্বনিম্ন অর্ডার মূল্য</Label>
                  <Input
                    type="number"
                    value={draft.min_order_amount}
                    onChange={(e) => setDraft({ ...draft, min_order_amount: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>সর্বোচ্চ ছাড় (ঐচ্ছিক)</Label>
                  <Input
                    type="number"
                    value={draft.max_discount}
                    onChange={(e) => setDraft({ ...draft, max_discount: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>ব্যবহারের সীমা</Label>
                  <Input
                    type="number"
                    value={draft.usage_limit}
                    onChange={(e) => setDraft({ ...draft, usage_limit: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 pt-6">
                  <Label className="font-normal">সক্রিয়</Label>
                  <Switch
                    checked={draft.is_active}
                    onCheckedChange={(v) => setDraft({ ...draft, is_active: v })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>শুরুর তারিখ</Label>
                  <Input
                    type="date"
                    value={draft.starts_at}
                    onChange={(e) => setDraft({ ...draft, starts_at: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>শেষ তারিখ</Label>
                  <Input
                    type="date"
                    value={draft.expires_at}
                    onChange={(e) => setDraft({ ...draft, expires_at: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>
              বাতিল
            </Button>
            <Button disabled={save.isPending} onClick={() => draft && save.mutate(draft)}>
              সংরক্ষণ করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
