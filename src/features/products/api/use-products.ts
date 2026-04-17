import { queryKeys } from "@shared/lib/query/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Product, ProductStatus, ProductsParams } from "../types/product.types";
import {
  bulkDeleteProducts,
  createProduct,
  deleteProduct,
  getFilterOptions,
  getProduct,
  getProducts,
  toggleProductStatus,
  updateProduct,
} from "./products.service";

// ─── Queries ────────────────────────────────────────────────────────────────

export function useProducts(params: ProductsParams = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(JSON.stringify(params)),
    queryFn: () => getProducts(params),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProduct(id),
    enabled: id.length > 0,
  });
}

export function useFilterOptions() {
  return useQuery({
    queryKey: queryKeys.products.filters(),
    queryFn: getFilterOptions,
    staleTime: 1000 * 60 * 10,
  });
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Product, "id" | "createdAt" | "updatedAt">) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => updateProduct(id, data),
    onSuccess: (_product, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id) });
    },
  });
}

export function useToggleProductStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProductStatus }) =>
      toggleProductStatus(id, status),
    onSuccess: (_product, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id) });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

export function useBulkDeleteProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteProducts(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}
