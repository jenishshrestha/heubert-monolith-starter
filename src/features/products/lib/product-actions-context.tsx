import { createContext, use, useMemo } from "react";
import type { Product } from "../types/product.types";

interface ProductActions {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductActionsContext = createContext<ProductActions | null>(null);

interface ProductActionsProviderProps extends ProductActions {
  children: React.ReactNode;
}

export function ProductActionsProvider({
  onEdit,
  onDelete,
  children,
}: ProductActionsProviderProps) {
  const value = useMemo(() => ({ onEdit, onDelete }), [onEdit, onDelete]);
  return <ProductActionsContext value={value}>{children}</ProductActionsContext>;
}

export function useProductActions(): ProductActions {
  const ctx = use(ProductActionsContext);
  if (!ctx) {
    throw new Error("useProductActions must be used within <ProductActionsProvider>");
  }
  return ctx;
}
