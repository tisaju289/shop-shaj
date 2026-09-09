import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdminHeading } from "@/components/admin/AdminShell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { formatMoney } from "@/lib/format";
import { fallbackImage } from "@/lib/media";
import { useSettings } from "@/lib/store-context";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/admin/products/")({
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const settings = useSettings();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin", "products", search],
    queryFn: async (): Promise<Product[]> => {
      let query = supabase
        .from("products")
        .select("*, categories(name,slug)")
        .order("created_at", { ascending: false })
        .limit(300);
      if (search.trim()) query = query.ilike("name", `%${search.trim()}%`);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as Product[];
    },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const { error } = await supabase.from("products").update({ is_published: value }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("আপডেট হয়েছে");
      void qc.invalidateQueries({ queryKey: ["admin", "products"] });
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("আপডেট করা যায়নি"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("পণ্য মুছে ফেলা হয়েছে");
      void qc.invalidateQueries({ queryKey: ["admin", "products"] });
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("মুছে ফেলা যায়নি — এই পণ্যের অর্ডার থাকতে পারে"),
  });

  return (
    <div>
      <AdminHeading
        title="পণ্য ব্যবস্থাপনা"
        description="পণ্য যোগ করুন, সম্পাদনা করুন ও স্টক নিয়ন্ত্রণ করুন"
        action={
          <Button asChild>
            <Link to="/admin/products/$id" params={{ id: "new" }}>
              <Plus className="size-4" /> নতুন পণ্য
            </Link>
          </Button>
        }
      />

      <Input
        placeholder="পণ্যের নাম দিয়ে খুঁজুন"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 max-w-xs"
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>পণ্য</TableHead>
                <TableHead>ক্যাটাগরি</TableHead>
                <TableHead>দাম</TableHead>
                <TableHead>স্টক</TableHead>
                <TableHead>প্রকাশিত</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={p.thumbnail_url || fallbackImage(p.name)}
                        alt=""
                        className="size-12 rounded-md object-cover"
                      />
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.sku ?? "—"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.categories?.name ?? "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {formatMoney(Number(p.sale_price ?? p.price), settings.currency)}
                    {p.sale_price ? (
                      <span className="ml-1 text-xs text-muted-foreground line-through">
                        {formatMoney(Number(p.price), settings.currency)}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant={Number(p.stock) > 0 ? "secondary" : "destructive"}>
                      {p.stock}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={p.is_published}
                      onCheckedChange={(value) => togglePublish.mutate({ id: p.id, value })}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button asChild size="icon" variant="outline" aria-label="সম্পাদনা">
                        <Link to="/admin/products/$id" params={{ id: p.id }}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="outline" aria-label="মুছে ফেলুন">
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>পণ্যটি মুছে ফেলবেন?</AlertDialogTitle>
                            <AlertDialogDescription>
                              এই কাজটি ফেরানো যাবে না। পণ্যটি ওয়েবসাইট থেকে সরে যাবে।
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>বাতিল</AlertDialogCancel>
                            <AlertDialogAction onClick={() => remove.mutate(p.id)}>
                              মুছে ফেলুন
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!products.length && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    কোনো পণ্য পাওয়া যায়নি।
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
