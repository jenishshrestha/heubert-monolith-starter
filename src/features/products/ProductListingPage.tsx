import { Button } from "@shared/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/Select";
import { usePermissions } from "@shared/hooks";
import type {
  AdvancedFilterConfig,
  DataTableConfig,
  DataTableQueryParams,
  DataTableServerResponse,
} from "@shared/lib/data-table";
import {
  createSelectionColumn,
  DT,
  exportCurrentPage,
  useDataTableAdvancedFilters,
  useDataTableContext,
} from "@shared/lib/data-table";
import { DownloadIcon, PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { lazy, Suspense, useCallback, useState } from "react";
import { getFilterOptions, getProducts } from "./api/products.service";
import { useBulkDeleteProducts } from "./api/use-products";
import { DeleteConfirmationDialog } from "./components/DeleteConfirmationDialog";
import { ProductCard } from "./components/ProductCard";
import { ProductPageHeader } from "./components/ProductPageHeader";
import { productColumns } from "./lib/columns";
import { ProductActionsProvider } from "./lib/product-actions-context";
import { STUDY_LEVEL_LABELS } from "./lib/product-format";
import type { Product, StudyLevel } from "./types/product.types";

// Heavy form modal (RHF + zod + editors) — split to its own chunk, loaded on demand.
const ProductFormModal = lazy(() =>
  import("./components/ProductFormModal").then((m) => ({ default: m.ProductFormModal })),
);

// ─── Module-level stable config ───

async function productsQueryFn(
  params: DataTableQueryParams,
): Promise<DataTableServerResponse<Product>> {
  const primarySort = params.sorting[0];
  const advanced = params.advancedFilters ?? {};
  const response = await getProducts({
    page: params.page + 1,
    limit: params.pageSize,
    search: params.search,
    sortBy: primarySort ? (primarySort.id as keyof Product) : "createdAt",
    order: primarySort?.desc ? "desc" : "asc",
    status: "all",
    country: advanced.country?.length ? advanced.country : undefined,
    institution: advanced.institution?.length ? advanced.institution : undefined,
    studyArea: advanced.studyArea?.length ? advanced.studyArea : undefined,
    studyLevel: advanced.studyLevel?.length ? (advanced.studyLevel as StudyLevel[]) : undefined,
  });
  return { data: response.data, total: response.pagination.total };
}

const advancedFilters: AdvancedFilterConfig = {
  sections: [
    {
      type: "chip",
      key: "studyLevel",
      title: "Select Study Level",
      multi: false,
    },
    {
      type: "flat",
      key: "country",
      title: "Country",
      searchPlaceholder: "Search countries...",
    },
    {
      type: "flat",
      key: "institution",
      title: "Institution",
      searchPlaceholder: "Search institutions...",
    },
    {
      type: "flat",
      key: "studyArea",
      title: "Study Area",
      searchPlaceholder: "Search study areas...",
    },
  ],
  groups: [
    {
      title: "Course Filters",
      keys: ["studyLevel", "country", "institution", "studyArea"],
    },
  ],
  queryKey: ["products", "filter-options"],
  getOptions: async () => {
    const options = await getFilterOptions();
    return {
      country: options.countries,
      institution: options.institutions,
      studyArea: options.studyAreas,
      studyLevel: options.studyLevels.map((level) => ({
        label: STUDY_LEVEL_LABELS[level],
        value: level,
      })),
    };
  },
};

const productsConfig: DataTableConfig<Product> = {
  columns: [createSelectionColumn<Product>(), ...productColumns],
  cardRenderer: (product, { isSelected, onSelect }) => (
    <ProductCard key={product.id} product={product} isSelected={isSelected} onSelect={onSelect} />
  ),
  dataSource: {
    mode: "server",
    queryKey: ["products", "list"] as const,
    queryFn: productsQueryFn,
  },
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 30, 50],
  },
  enableSorting: true,
  enableRowSelection: true,
  syncWithUrl: true,
  advancedFilters,
};

// ─── Toolbar bits ───

function QuickStudyLevelFilter() {
  const advanced = useDataTableAdvancedFilters();
  const current = advanced.filters.studyLevel?.[0] ?? "all";

  return (
    <Select
      value={current}
      onValueChange={(value) => {
        if (value === "all") {
          advanced.clearSection("studyLevel");
        } else {
          advanced.setSection("studyLevel", [value]);
        }
      }}
    >
      <SelectTrigger className="w-40">
        <SelectValue placeholder="All levels" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All levels</SelectItem>
        {(Object.keys(STUDY_LEVEL_LABELS) as StudyLevel[]).map((level) => (
          <SelectItem key={level} value={level}>
            {STUDY_LEVEL_LABELS[level]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ToolbarExport() {
  const { table } = useDataTableContext<Product>();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => exportCurrentPage(table, { filename: "products" })}
    >
      <DownloadIcon className="size-4" />
      Export CSV
    </Button>
  );
}

function BulkActions() {
  const { table } = useDataTableContext<Product>();
  const { canBulkDelete } = usePermissions();
  const [showDialog, setShowDialog] = useState(false);
  const bulkDelete = useBulkDeleteProducts();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map((r) => r.original.id);

  const handleConfirm = useCallback(() => {
    bulkDelete.mutate(selectedIds, {
      onSuccess: () => {
        setShowDialog(false);
        table.resetRowSelection();
      },
    });
  }, [bulkDelete, selectedIds, table]);

  return (
    <>
      <Button variant="outline" size="sm">
        <PencilIcon className="size-4" />
        Bulk Edit
      </Button>
      {canBulkDelete && (
        <>
          <Button variant="destructive" size="sm" onClick={() => setShowDialog(true)}>
            <TrashIcon className="size-4" />
            Delete ({selectedRows.length})
          </Button>
          <DeleteConfirmationDialog
            open={showDialog}
            onOpenChange={setShowDialog}
            onConfirm={handleConfirm}
            title="Delete selected products"
            description={`This will permanently delete ${selectedRows.length} product(s). This action cannot be undone.`}
            isPending={bulkDelete.isPending}
          />
        </>
      )}
    </>
  );
}

// ─── Main Page ───

export function ProductListingPage() {
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const deleteSingle = useBulkDeleteProducts();

  const formOpen = addOpen || Boolean(editTarget);

  function handleFormOpenChange(open: boolean) {
    if (!open) {
      setAddOpen(false);
      setEditTarget(null);
    }
  }

  return (
    <ProductActionsProvider onEdit={setEditTarget} onDelete={setDeleteTarget}>
      <div className="space-y-6">
        <ProductPageHeader.Root>
          <ProductPageHeader.Content>
            <ProductPageHeader.Title>Products</ProductPageHeader.Title>
            <ProductPageHeader.Description>
              Manage educational courses and programs
            </ProductPageHeader.Description>
          </ProductPageHeader.Content>
          <ProductPageHeader.Actions>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <PlusIcon className="size-4" />
              Add Product
            </Button>
          </ProductPageHeader.Actions>
        </ProductPageHeader.Root>

        <DT.Root config={productsConfig} className="space-y-4">
          <DT.Toolbar className="flex items-center gap-2">
            <DT.FilterBar searchPlaceholder="Search products...">
              <QuickStudyLevelFilter />
            </DT.FilterBar>
            <div className="ml-auto flex items-center gap-2">
              <DT.ViewToggle />
              <ToolbarExport />
            </div>
          </DT.Toolbar>

          <DT.Content />
          <DT.Pagination />

          <DT.BulkBar>
            <BulkActions />
          </DT.BulkBar>
        </DT.Root>

        {formOpen && (
          <Suspense fallback={null}>
            <ProductFormModal
              open={formOpen}
              onOpenChange={handleFormOpenChange}
              initialData={editTarget}
            />
          </Suspense>
        )}

        <DeleteConfirmationDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteTarget(null);
            }
          }}
          onConfirm={() => {
            if (deleteTarget) {
              deleteSingle.mutate([deleteTarget.id], {
                onSuccess: () => setDeleteTarget(null),
              });
            }
          }}
          title={deleteTarget ? `Delete "${deleteTarget.name}"` : "Delete product"}
          description="This will permanently delete this product. This action cannot be undone."
          isPending={deleteSingle.isPending}
        />
      </div>
    </ProductActionsProvider>
  );
}
