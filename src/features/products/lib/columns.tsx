import { Badge } from "@shared/components/ui/Badge";
import type { DataTableColumnDef } from "@shared/lib/data-table";
import { DataTableColumnHeader } from "@shared/lib/data-table";
import { ProductRowActions } from "../components/ProductRowActions";
import type { Product } from "../types/product.types";
import { formatFees, STUDY_LEVEL_LABELS } from "./product-format";

export const productColumns: DataTableColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Product" />,
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-foreground">{row.original.name}</span>
        <span className="text-xs text-muted-foreground">{row.original.institution}</span>
      </div>
    ),
    meta: { label: "Product" },
    size: 280,
  },
  {
    accessorKey: "country",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Country" />,
    meta: { label: "Country" },
    size: 140,
  },
  {
    accessorKey: "studyArea",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Study Area" />,
    meta: { label: "Study Area" },
    size: 180,
  },
  {
    accessorKey: "studyLevel",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Level" />,
    cell: ({ row }) => (
      <Badge variant="secondary">{STUDY_LEVEL_LABELS[row.original.studyLevel]}</Badge>
    ),
    meta: { label: "Level" },
    size: 140,
  },
  {
    accessorKey: "fees",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fees" />,
    cell: ({ row }) => (
      <span className="font-medium">{formatFees(row.original.fees, row.original.currency)}</span>
    ),
    meta: { label: "Fees" },
    size: 120,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={status === "active" ? "default" : "outline"} className="capitalize">
          {status}
        </Badge>
      );
    },
    meta: { label: "Status" },
    size: 100,
  },
  {
    id: "actions",
    cell: ({ row }) => <ProductRowActions product={row.original} />,
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
];
