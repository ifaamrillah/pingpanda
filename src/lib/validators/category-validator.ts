import { z } from "zod"

export const EVENT_CATEGORY_VALIDATOR = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .regex(
      /^[a-zA-Z0-9~\-]+$/,
      "Category name can only contain letters, numbers or hyphens"
    ),
  color: z
    .string()
    .min(1, "Color is required")
    .regex(/^#[0-9A-Fa-f]{6}$/i, "Invalid color format"),
  emoji: z.string().emoji("Invalid emoji").optional(),
})

export type EventCategoryForm = z.infer<typeof EVENT_CATEGORY_VALIDATOR>
