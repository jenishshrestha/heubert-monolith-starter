/**
 * Service layer for products.
 *
 * Currently wraps the local mock-db. When the real backend is ready,
 * replace these function bodies with `apiClient` calls (same signatures).
 * No other file needs to change.
 *
 * Example post-migration:
 *   export async function getProducts(params: ProductsParams) {
 *     const { data } = await apiClient.get<PaginatedResponse<Product>>("/api/products", { params });
 *     return data;
 *   }
 */

import type {
  FilterOptions,
  PaginatedResponse,
  Product,
  ProductStatus,
  ProductsParams,
} from "../types/product.types";
import * as mockDb from "./mock-db";

export function getProducts(params?: ProductsParams): Promise<PaginatedResponse<Product>> {
  return mockDb.getProducts(params);
}

export function getProduct(id: string): Promise<Product> {
  return mockDb.getProduct(id);
}

export function createProduct(
  data: Omit<Product, "id" | "createdAt" | "updatedAt">,
): Promise<Product> {
  return mockDb.createProduct(data);
}

export function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  return mockDb.updateProduct(id, data);
}

export function toggleProductStatus(id: string, status: ProductStatus): Promise<Product> {
  return mockDb.toggleProductStatus(id, status);
}

export function deleteProduct(id: string): Promise<void> {
  return mockDb.deleteProduct(id);
}

export function bulkDeleteProducts(ids: string[]): Promise<{ deleted: number }> {
  return mockDb.bulkDeleteProducts(ids);
}

export function getFilterOptions(): Promise<FilterOptions> {
  return mockDb.getFilterOptions();
}
