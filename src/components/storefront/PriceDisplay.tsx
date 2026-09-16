import { cn } from "@/lib/utils";
import { discountPercent, effectivePrice, formatMoney } from "@/lib/format";
import { useSettings } from "@/lib/store-context";

export function PriceDisplay({
  price,
  salePrice,
  className,
  size = "md",
  showDiscount = true,
}: {
  price: number;
  salePrice?: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
  showDiscount?: boolean;
}) {
  const { currency } = useSettings();
  const final = effectivePrice(price, salePrice);
  const off = discountPercent(price, salePrice);

  return (
    <div className={cn("flex flex-wrap items-baseline justify-start gap-2", className)}>
      <span
        className={cn(
          "font-semibold text-foreground",
          size === "sm" && "text-sm",
          size === "md" && "text-base",
          size === "lg" && "text-2xl",
        )}
      >
        {formatMoney(final, currency)}
      </span>
      {off > 0 && (
        <>
          <span
            className={cn(
              "text-muted-foreground line-through",
              size === "lg" ? "text-base" : "text-xs",
            )}
          >
            {formatMoney(price, currency)}
          </span>
          {showDiscount && (
            <span className="rounded-sm bg-destructive/10 px-1.5 py-0.5 text-[11px] font-medium text-destructive">
              {off}% ছাড়
            </span>
          )}
        </>
      )}
    </div>
  );
}
