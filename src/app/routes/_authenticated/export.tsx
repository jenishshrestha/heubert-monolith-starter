import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/export")({
  component: ExportPage,
});

function ExportPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-medium tracking-tight">Export</h1>
      <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        Export interface will be implemented in Phase 4
      </div>
    </div>
  );
}
