import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminHeading } from "@/components/admin/AdminShell";
import { RatingStars } from "@/components/storefront/RatingStars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/lib/format";
import type { Review } from "@/lib/types";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviewsPage,
});

function AdminReviewsPage() {
  const qc = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: async (): Promise<Review[]> => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, products(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Review[];
    },
  });

  const approve = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const { error } = await supabase.from("reviews").update({ is_approved: value }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("রিভিউ আপডেট হয়েছে");
      void qc.invalidateQueries({ queryKey: ["admin"] });
      void qc.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: () => toast.error("আপডেট করা যায়নি"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("রিভিউ মুছে ফেলা হয়েছে");
      void qc.invalidateQueries({ queryKey: ["admin"] });
      void qc.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: () => toast.error("মুছে ফেলা যায়নি"),
  });

  return (
    <div>
      <AdminHeading title="রিভিউ ব্যবস্থাপনা" description="ক্রেতাদের রিভিউ অনুমোদন করুন" />

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-border bg-card p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{r.reviewer_name}</span>
                  <Badge variant={r.is_approved ? "secondary" : "outline"}>
                    {r.is_approved ? "অনুমোদিত" : "অপেক্ষমাণ"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(r.created_at)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  পণ্য: {r.products?.name ?? "—"}
                </p>
                <RatingStars rating={r.rating} className="mt-1.5" />
                {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={r.is_approved ? "outline" : "default"}
                  onClick={() => approve.mutate({ id: r.id, value: !r.is_approved })}
                >
                  <Check className="size-4" />
                  {r.is_approved ? "অনুমোদন বাতিল" : "অনুমোদন দিন"}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="মুছে ফেলুন"
                  onClick={() => remove.mutate(r.id)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {!reviews.length && (
            <p className="rounded-lg border border-border bg-card p-10 text-center text-muted-foreground">
              এখনও কোনো রিভিউ নেই।
            </p>
          )}
        </div>
      )}
    </div>
  );
}
