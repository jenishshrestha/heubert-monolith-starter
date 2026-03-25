import { ThemeProvider } from "@shared/components/providers";
import { queryClient } from "@shared/lib/query/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet, useRouter } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((m) => ({ default: m.ReactQueryDevtools })),
    )
  : () => null;

const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/router-devtools").then((m) => ({ default: m.TanStackRouterDevtools })),
    )
  : () => null;

function NotFoundComponent() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <p className="text-muted-foreground">The page you are looking for does not exist.</p>
        <button
          type="button"
          onClick={() => router.navigate({ to: "/" })}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}

function ErrorComponent({ error }: { error: Error }) {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
        <p className="text-muted-foreground">{error.message || "An unexpected error occurred."}</p>
        <button
          type="button"
          onClick={() => router.navigate({ to: "/" })}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background font-sans antialiased">
          <Outlet />
        </div>
        <Suspense>
          <ReactQueryDevtools initialIsOpen={false} />
          <TanStackRouterDevtools position="bottom-left" />
        </Suspense>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
