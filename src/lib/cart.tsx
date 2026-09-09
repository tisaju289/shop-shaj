import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  key: string;
  productId: string;
  variantId: string | null;
  slug: string;
  name: string;
  image: string | null;
  size: string | null;
  color: string | null;
  unitPrice: number;
  quantity: number;
  maxStock: number;
};

const STORAGE_KEY = "cart:v1";

type CartApi = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "key">) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  hydrated: boolean;
};

const CartContext = createContext<CartApi | null>(null);

function itemKey(item: Omit<CartItem, "key">) {
  return [item.productId, item.variantId ?? "", item.size ?? "", item.color ?? ""].join("|");
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore corrupt cart */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = useCallback((incoming: Omit<CartItem, "key">) => {
    const key = itemKey(incoming);
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        const max = incoming.maxStock || existing.maxStock || 99;
        return prev.map((i) =>
          i.key === key
            ? { ...i, quantity: Math.min(i.quantity + incoming.quantity, max || 99) }
            : i,
        );
      }
      return [...prev, { ...incoming, key }];
    });
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.key === key
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock || 99)) }
          : i,
      ),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartApi>(
    () => ({
      items,
      hydrated,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
      add,
      remove,
      setQuantity,
      clear,
    }),
    [items, hydrated, add, remove, setQuantity, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
