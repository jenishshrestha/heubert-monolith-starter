import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@shared/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui/Dialog";
import { Form } from "@shared/components/ui/Form";
import { useEffect, useId, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useCreateProduct, useUpdateProduct } from "../api/use-products";
import {
  type ProductFormValues,
  productFormDefaults,
  productFormSchema,
} from "../lib/product.schema";
import type { Product } from "../types/product.types";
import { ProductFormBody } from "./ProductForm";

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Product | null;
}

function toFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    code: product.code,
    institution: product.institution,
    country: product.country,
    studyArea: product.studyArea,
    studyLevel: product.studyLevel,
    duration: product.duration,
    fees: product.fees,
    currency: product.currency as ProductFormValues["currency"],
    description: product.description,
    branches: product.branches.map((b) => ({
      id: b.id,
      name: b.name,
      country: b.country,
      address: b.address ?? "",
    })),
    entryRequirements: product.entryRequirements.map((r) => ({
      id: r.id,
      examName: r.examName as ProductFormValues["entryRequirements"][number]["examName"],
      overallScore: r.overallScore,
      minimumBandScores: r.minimumBandScores ?? {},
      recognized: r.recognized,
    })),
    intakes: product.intakes,
    status: product.status,
  };
}

export function ProductFormModal({ open, onOpenChange, initialData }: ProductFormModalProps) {
  const isEdit = Boolean(initialData);
  const formId = useId();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: productFormDefaults(),
    mode: "onBlur",
  });

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const existingBranchIds = useMemo(
    () => new Set((initialData?.branches ?? []).map((b) => b.id)),
    [initialData],
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    form.reset(initialData ? toFormValues(initialData) : productFormDefaults());
  }, [open, initialData, form]);

  function onSubmit(values: ProductFormValues) {
    if (isEdit && initialData) {
      updateMutation.mutate(
        { id: initialData.id, data: values },
        {
          onSuccess: () => onOpenChange(false),
        },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => onOpenChange(false),
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent
        className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-3xl"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>{isEdit ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update course details, branches, and entry requirements."
              : "Create a new course with branches, intakes, and entry requirements."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <Form {...form}>
            <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
              <ProductFormBody existingBranchIds={existingBranchIds} />
            </form>
          </Form>
        </div>

        <DialogFooter className="flex-row justify-end gap-2 border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={isPending}>
            {isPending ? "Saving..." : isEdit ? "Save Product" : "Add Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
