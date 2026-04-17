import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/products/$productId")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-medium tracking-tight">Product: {productId}</h1>
      <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        Product detail/edit will be implemented in Phase 3
      </div>
    </div>
  );
}
