import { LoginPage } from "@features/auth";
import { useUserStore } from "@shared/stores";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (useUserStore.getState().isAuthenticated) {
      throw redirect({ to: "/products" });
    }
  },
  component: LoginPage,
});
