import { authenticate } from "@shared/lib/auth/credentials";
import { useUserStore } from "@shared/stores";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

export function useLogin() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => {
      return Promise.resolve(authenticate(email, password));
    },
    onSuccess: async ({ user, token }) => {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));
      setUser(user);
      // Clear cached route matches so beforeLoad re-evaluates with the new auth state.
      // Without this, TanStack Router may use a stale "redirect to /login" decision
      // cached from an earlier unauthenticated visit, causing a /products ↔ /login loop.
      await router.invalidate();
      await router.navigate({ to: "/products" });
    },
  });
}
