import { Ruler } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSettings } from "@/lib/store-context";

export function SizeChartDialog() {
  const settings = useSettings();
  const columns = settings.size_chart_columns ?? [];
  const rows = (settings.size_chart_rows ?? []).filter((r) => r.some((c) => c?.trim()));

  if (!settings.size_chart_enabled || !columns.length || !rows.length) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-1.5">
          <Ruler className="size-4" />
          {settings.size_chart_title || "সাইজ চার্ট"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{settings.size_chart_title || "সাইজ চার্ট"}</DialogTitle>
          {settings.size_chart_note && (
            <DialogDescription>{settings.size_chart_note}</DialogDescription>
          )}
        </DialogHeader>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                {columns.map((c, i) => (
                  <th key={i} className="px-3 py-2 text-left font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-t border-border">
                  {columns.map((_, ci) => (
                    <td key={ci} className="px-3 py-2 text-muted-foreground">
                      {row[ci] ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
