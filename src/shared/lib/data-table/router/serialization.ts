import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";

export function parseSortParam(sort?: string): SortingState {
  if (!sort) {
    return [];
  }
  const [id, dir] = sort.split(".");
  if (!id) {
    return [];
  }
  return [{ id, desc: dir === "desc" }];
}

export function serializeSortState(sorting: SortingState): string | undefined {
  const first = sorting[0];
  if (!first) {
    return undefined;
  }
  return `${first.id}.${first.desc ? "desc" : "asc"}`;
}

export function parseFiltersParam(filters?: string): ColumnFiltersState {
  if (!filters) {
    return [];
  }
  try {
    return JSON.parse(filters) as ColumnFiltersState;
  } catch {
    return [];
  }
}

export function serializeFiltersState(filters: ColumnFiltersState): string | undefined {
  if (filters.length === 0) {
    return undefined;
  }
  return JSON.stringify(filters);
}
