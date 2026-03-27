# DataTable System — Full Code Review (v3)

Scope: All files in `src/shared/lib/data-table/` and `src/shared/components/ui/DataTable/`.
Focus: Library-grade readiness + re-render performance.
Skills: FDD Architecture, Vercel React Best Practices, Vercel Composition Patterns.

## Verdict

| Domain | Rating | Notes |
| --- | --- | --- |
| Architecture | A | Clean FDD structure, proper public API boundaries, provider/middleware/compound all well separated |
| Performance | B | Split context is excellent. Two medium issues remain: focused hooks leak via StableCtx, RangeFilter local state desyncs |
| Library-grade | B | Strong API surface, good extensibility. Cursor tracking and REST pagination edge cases need hardening |
| Type Safety | A | Proper generics, discriminated unions, minimal `as` casts |
| Security | A | No sensitive data exposure, auth delegated to interceptors |

**Decision**: Approve with changes

## Library-Grade Assessment: 8/10

**Passes as a library.** The system has:
- Clean separation: hooks (logic) vs components (UI) vs providers (transport)
- Transport-agnostic DataProvider interface
- Composable middleware chain
- Compound composition with focused context hooks
- 3 filter types (multi-select, single-select, range)
- Full TypeScript generics through the stack
- Documentation (`docs/data-table.md`)

**Before npm extraction, fix:** cursor tracking safety, REST pagination type guards, RangeFilter sync.

## Re-render Performance: Split Context Trace

### Architecture (correct)

```
DataTableRoot renders
  │
  ├─ StableCtx   (useMemo) ── table ref, config, callbacks ── rarely changes
  ├─ SearchCtx   (useMemo) ── globalFilter ── changes on search only
  ├─ ViewCtx     (useMemo) ── view ── changes on view toggle only
  └─ ReactiveCtx (no memo) ── table, loading, data ── changes on every table state change
```

### Row selection click: what re-renders

| Component | Context | Re-renders? | Correct? |
|-----------|---------|-------------|----------|
| CompoundSearch | SearchCtx | No | Yes |
| CompoundFilter | ReactiveCtx | Yes | Yes (needs filter state) |
| CompoundSingleFilter | ReactiveCtx | Yes | Yes |
| CompoundRangeFilter | ReactiveCtx | Yes | Yes |
| CompoundViewToggle | ViewCtx | No | Yes |
| CompoundViewOptions | StableCtx | No | Yes |
| CompoundToolbar | ReactiveCtx + SearchCtx + StableCtx | Yes | Acceptable (needs filter state for Reset button) |
| CompoundPagination | ReactiveCtx + StableCtx | Yes | Yes (needs page state) |
| CompoundBulkBar | ReactiveCtx | Yes | Yes (needs selection count) |
| DataTableContent | ReactiveCtx + ViewCtx + StableCtx | Yes | Yes (needs to render rows) |

**Verdict: Good.** Search and ViewToggle are properly isolated. The remaining re-renders are necessary.

### Remaining leak

`useDataTableSearch()` and `useDataTableView()` read from StableCtx to get `setGlobalFilter`/`setView` callbacks. If StableCtx ever changes (unlikely but possible on config change), Search and ViewToggle would re-render unnecessarily. Low impact in practice.

## Findings

### HIGH

1. **RangeFilter local state not synced with external changes** — Vercel React `rerender-derived-state`
   - File: `DataTableRangeFilter.tsx:31-32`
   - If filter is cleared via Reset button or URL navigation, the input fields still show stale values. Missing `useEffect` to sync `localMin`/`localMax` when `filterValue` changes externally.
   - Fix: Add sync effect.

2. **REST provider pagination type mismatch not guarded** — Explicit Predictability
   - File: `providers/rest-provider.ts:59-92`
   - `buildPaginationParams` handles all 3 pagination types via fallback math, but if `mapping.style` is `"offset"` and `paginationType` is `"cursor"`, the offset calculation produces `0` silently. Should fail fast or warn.
   - Fix: Add runtime check that pagination types are compatible.

3. **rest-provider `response.json()` can throw** — Error Handling
   - File: `providers/rest-provider.ts:241`
   - If server returns non-JSON (HTML error page, empty body), `response.json()` throws unhandled.
   - Fix: Wrap in try-catch with descriptive error.

### MEDIUM

4. **useDataTableSearch reads StableCtx (leaks re-render boundary)** — Vercel React `rerender-split-combined-hooks`
   - File: `DataTableContext.tsx:73-75`
   - `useDataTableSearch()` reads both SearchCtx and StableCtx to get `setGlobalFilter`. If StableCtx changes, Search re-renders. Low probability but violates the split principle.
   - Fix (optional): Extract callbacks to a 5th `CallbackCtx` that's always stable. Low priority since StableCtx is well-memoized.

5. **DataTableContent subscribes to all 4 contexts** — Vercel React `rerender-defer-reads`
   - File: `compound/DataTableContent.tsx:36-39`
   - Even when render prop is not used, all hooks are called. When render prop IS used, it passes the combined context object, subscribing the consumer to everything.
   - Low practical impact since Content needs to re-render on most state changes anyway.

6. **Cursor map mutation in queryFn closure** — Explicit Predictability
   - File: `provider/resolveProviderDataSource.ts:108`
   - `cursorMap.set()` is called inside the queryFn, which is an async closure. If React Query re-evaluates or retries, the cursor could be set multiple times. Currently safe because `set()` is idempotent (same page → same cursor), but fragile.
   - Fix (optional): Make cursor updates idempotent by checking before setting.

7. **noopQueryFn uses `as never[]`** — Type Safety
   - File: `useDataTable.ts:27`
   - Unnecessary cast. `[] as TData[]` would be clearer but also unnecessary since the query is disabled.
   - Fix: Remove cast, use `{ data: [], total: 0 }`.

### LOW

8. **DataTableFacetedFilter creates new Set on every render** — Vercel React `rerender-memo`
   - File: `DataTableFacetedFilter.tsx:36`
   - `new Set(column?.getFilterValue() as string[])` runs every render. Cheap operation but could be memoized.

9. **Cursor pagination backward navigation not supported**
   - File: `resolveProviderDataSource.ts:106-109`
   - Only `nextCursor` is stored. `previousCursor` from the response is returned but not persisted for backward navigation. Fine for forward-only pagination but should be documented.

10. **middleware/retry.ts doesn't respect AbortSignal during retries**
    - File: `middleware/retry.ts:47`
    - If the request is aborted mid-retry, the loop continues to the next attempt.
    - Fix: Check `params.signal?.aborted` before each retry.

## What's Working Well

- **4-context split** is the right architecture. Search/ViewToggle are isolated from table state changes. Only components that render table data subscribe to ReactiveCtx.
- **useCallback on local setters** (useDataTable.ts:112-125) ensures stable references for debounce and child components.
- **useMemo on query params** (useDataTableQuery.ts:21-30) prevents React Query cache thrashing.
- **Provider values stored directly** (not wrapped in objects) in both DataProviderRegistry and DataTableProvider — prevents root-level cascade.
- **3 filter types** (multi-select, single-select, range) with consistent compound wrapper pattern.
- **DataProvider interface** is clean and transport-agnostic. REST, Axios, GraphQL, and custom providers all implement the same contract.
- **Middleware composition** is simple function wrapping — no framework, no registration, fully tree-shakeable.

## Top 3 Priority Fixes

1. **RangeFilter sync** (#1) — Add useEffect to sync local state with external filter changes. Users see stale inputs after Reset.
2. **rest-provider JSON error** (#3) — Wrap `response.json()` in try-catch. Prevents unhandled crash on non-JSON responses.
3. **REST pagination type guard** (#2) — Validate that mapping style is compatible with pagination type. Fail fast instead of silent wrong offset.
