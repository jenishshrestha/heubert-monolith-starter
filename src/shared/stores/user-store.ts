import { type User, UserSchema } from "@shared/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

function clearPersistedAuth() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
}

function rehydrateUser(): { user: User | null; isAuthenticated: boolean } {
  try {
    const token = localStorage.getItem("auth_token");
    const raw = localStorage.getItem("auth_user");
    if (!token || !raw) {
      return { user: null, isAuthenticated: false };
    }
    const parsed = UserSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      clearPersistedAuth();
      return { user: null, isAuthenticated: false };
    }
    return { user: parsed.data, isAuthenticated: true };
  } catch {
    clearPersistedAuth();
    return { user: null, isAuthenticated: false };
  }
}

const initial = rehydrateUser();

export const useUserStore = create<UserStore>()(
  devtools(
    (set) => ({
      user: initial.user,
      isAuthenticated: initial.isAuthenticated,
      setUser: (user) => set({ user, isAuthenticated: user !== null }, false, "setUser"),
      logout: () => {
        clearPersistedAuth();
        set({ user: null, isAuthenticated: false }, false, "logout");
      },
    }),
    { name: "UserStore" },
  ),
);
