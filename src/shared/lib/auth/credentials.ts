import type { User } from "@shared/types";

const CREDENTIALS: Record<string, { password: string; user: User }> = {
  "user@experteducation.com": {
    password: "user123",
    user: {
      id: "user-1",
      email: "user@experteducation.com",
      name: "Basic User",
      role: "user",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
  },
  "superadmin@experteducationc.com": {
    password: "admin123",
    user: {
      id: "admin-1",
      email: "superadmin@experteducationc.com",
      name: "Super Admin",
      role: "admin",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
  },
};

export function authenticate(email: string, password: string): { user: User; token: string } {
  const entry = CREDENTIALS[email.toLowerCase()];

  if (!entry || entry.password !== password) {
    throw new Error("Invalid email or password");
  }

  const token = btoa(JSON.stringify({ email: entry.user.email, role: entry.user.role }));

  return { user: entry.user, token };
}
