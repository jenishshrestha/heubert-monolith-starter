import { z } from "zod";

// Common types
export type ID = string;
export type Timestamp = string; // ISO 8601 format for API transport

// User types
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().url().optional(),
  role: z.enum(["admin", "user"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

export const UserRoles = ["admin", "user"] as const;
export type UserRole = (typeof UserRoles)[number];

// API Response types
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional(),
});

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export const PaginatedResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  });

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// Re-export only the z constructor for schema creation convenience
export { z } from "zod";
