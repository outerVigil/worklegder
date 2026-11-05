
import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, "Email or employee code is required")
    .max(254, "Identifier is too long"),

  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password is too long"),
}).strict();
