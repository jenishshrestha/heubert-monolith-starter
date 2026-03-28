import type { Table } from "@tanstack/react-table";

interface ExportCsvOptions {
  filename?: string;
  onlyVisible?: boolean;
}

function escapeCsvValue(value: unknown): string {
  const str = value == null ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsv<TData>(
  table: Table<TData>,
  rows: { getValue: (id: string) => unknown }[],
  onlyVisible: boolean,
): string {
  const columns = (onlyVisible ? table.getVisibleLeafColumns() : table.getAllLeafColumns()).filter(
    (col) => col.id !== "select" && col.id !== "actions",
  );

  const headers = columns.map(
    (col) => (col.columnDef.meta as { label?: string } | undefined)?.label ?? col.id,
  );

  const csvRows = rows.map((row) =>
    columns.map((col) => escapeCsvValue(row.getValue(col.id))).join(","),
  );

  return [headers.map(escapeCsvValue).join(","), ...csvRows].join("\n");
}

function downloadCsv(csv: string, filename: string): void {
  // UTF-8 BOM for Excel compatibility
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export selected rows to CSV (client-side, data already in memory).
 * Used by the bulk action bar.
 */
export function exportSelectedRows<TData>(
  table: Table<TData>,
  options: ExportCsvOptions = {},
): void {
  const { filename = "export-selected", onlyVisible = true } = options;
  const rows = table.getFilteredSelectedRowModel().rows;
  if (rows.length === 0) return;
  const csv = buildCsv(table, rows, onlyVisible);
  downloadCsv(csv, filename);
}

/**
 * Export current page rows to CSV (client-side).
 */
export function exportCurrentPage<TData>(
  table: Table<TData>,
  options: ExportCsvOptions = {},
): void {
  const { filename = "export", onlyVisible = true } = options;
  const rows = table.getRowModel().rows;
  const csv = buildCsv(table, rows, onlyVisible);
  downloadCsv(csv, filename);
}

/**
 * Trigger a server-side export by navigating to the export endpoint.
 * The server generates the full CSV with current filters/sort applied.
 */
export function exportFromServer(endpoint: string, params?: Record<string, string>): void {
  const url = new URL(endpoint, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  const link = document.createElement("a");
  link.href = url.toString();
  link.download = "";
  link.click();
}
