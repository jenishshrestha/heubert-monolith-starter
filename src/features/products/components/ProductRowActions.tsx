import { usePermissions } from "@shared/hooks";
import { DataTableRowActions, type RowAction } from "@shared/lib/data-table";
import { EyeIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useProductActions } from "../lib/product-actions-context";
import type { Product } from "../types/product.types";

export function ProductRowActions({ product }: { product: Product }) {
  const { canDelete } = usePermissions();
  const { onEdit, onDelete } = useProductActions();

  const actions: RowAction<Product>[] = [
    { label: "View", icon: EyeIcon, onClick: onEdit },
    { label: "Edit", icon: PencilIcon, onClick: onEdit },
  ];

  if (canDelete) {
    actions.push({
      label: "Delete",
      icon: TrashIcon,
      variant: "destructive",
      onClick: onDelete,
    });
  }

  return <DataTableRowActions row={product} actions={actions} />;
}
