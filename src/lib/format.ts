export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value ?? 0);
}

export function formatMoney(value: number, currency = "৳") {
  return `${currency}${formatNumber(value)}`;
}

export function effectivePrice(price: number, salePrice?: number | null) {
  return salePrice && salePrice > 0 && salePrice < price ? salePrice : price;
}

export function discountPercent(price: number, salePrice?: number | null) {
  if (!salePrice || salePrice <= 0 || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

export function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("bn-BD", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function formatDateTime(value: string) {
  try {
    return new Intl.DateTimeFormat("bn-BD", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}
