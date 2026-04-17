import { useUserStore } from "@shared/stores";

export function usePermissions() {
  const user = useUserStore((s) => s.user);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const isSuperadmin = user?.role === "admin";

  return {
    isAuthenticated,
    isSuperadmin,
    canDelete: isSuperadmin,
    canBulkDelete: isSuperadmin,
    canDisable: isAuthenticated,
  };
}
