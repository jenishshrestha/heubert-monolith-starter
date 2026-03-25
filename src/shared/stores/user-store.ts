import type { User } from "@shared/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

/**
 * User store using Zustand with devtools
 */
export const useUserStore = create<UserStore>()(
  devtools(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: user !== null }, false, "setUser"),
      logout: () => {
        localStorage.removeItem("auth_token");
        set({ user: null, isAuthenticated: false }, false, "logout");
      },
    }),
    { name: "UserStore" },
  ),
);
