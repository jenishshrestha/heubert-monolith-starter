# DataTable System (P0) — Code Review

## Verdict

| Domain       | Rating | Notes                                                    |
| ------------ | ------ | -------------------------------------------------------- |
| Architecture | B      | Solid FDD compliance, one conditional hook violation      |
| Styling      | A      | Semantic tokens throughout, minor arbitrary value usage   |
| Security     | A      | No vulnerabilities found                                 |

**Decision**: Approve with changes

## Findings

### HIGH

1. **Conditional hook call in `useDataTable.ts:81-92`** — Violates React's rules of hooks.
   `useDataTableQuery` is called conditionally based on `dataSource.mode === "server"`. The `eslint-disable` comment masks the violation. While it works in practice because `mode` is static per instance, this is fragile — if config changes at runtime, it will crash.
   **Fix**: Always call `useDataTableQuery` but pass an `enabled: false` option when in client mode. This is the standard TanStack Query pattern.

### MEDIUM

2. **`useLocalState` wrapper is unnecessary** — Violates KISS principle (FDD skill).
   `useDataTable.ts:21-23` wraps `useState` with `useLocalState` that adds nothing. It exists to type-match the URL state setters, but TypeScript already handles this.
   **Fix**: Replace with direct `useState` calls.

3. **`university` column truncation uses arbitrary value** — Minor Tailwind v4 violation.
   `columns.tsx:70`: `max-w-[200px]` is an arbitrary value. Prefer `max-w-xs` (320px) or `max-w-48` (192px) from the scale.
   **Fix**: `<span className="max-w-48 truncate">` or use `max-w-xs` depending on desired width.

### LOW

4. **Missing `import type` for `React` namespace** — FDD import conventions.
   `DataTableColumnHeader.tsx:14` uses `React.HTMLAttributes` but has no explicit React import. It works via the global JSX transform but is inconsistent with other files that use `import type * as React from "react"`.

5. **`DataTablePagination` arbitrary width** — Tailwind v4.
   `DataTablePagination.tsx:48`: `w-[70px]` and line 60: `w-[100px]` are arbitrary values. These are acceptable for precise alignment in table controls but worth noting.

6. **Spinner in `DataTable.tsx` is a raw div** — Minor a11y concern.
   `DataTable.tsx:23-25`: The loading overlay has no `aria-busy` or `role="status"` for screen readers.
   **Fix**: Add `role="status" aria-label="Loading"` to the overlay div.

## Top 3 Priority Fixes

1. **Fix conditional hook** (`useDataTable.ts`) — Add `enabled` flag to `useDataTableQuery` instead of conditional call. This prevents potential React crashes and removes the eslint-disable.
2. **Add a11y to loading overlay** (`DataTable.tsx`) — Add `role="status"` and `aria-label` to the spinner overlay.
3. **Remove `useLocalState` wrapper** (`useDataTable.ts`) — Replace with direct `useState` for clarity.
