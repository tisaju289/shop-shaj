import { Minus, Plus } from "lucide-react";

export function QuantitySelector({
  value,
  max,
  onChange,
}: {
  value: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  const limit = max && max > 0 ? max : 99;
  return (
    <div className="inline-flex h-10 items-center rounded-md border border-border">
      <button
        type="button"
        aria-label="কমান"
        className="grid h-full w-10 place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus className="size-4" />
      </button>
      <span className="w-10 text-center text-sm font-medium">{value}</span>
      <button
        type="button"
        aria-label="বাড়ান"
        className="grid h-full w-10 place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
        disabled={value >= limit}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
