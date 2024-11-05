import { z } from "zod"

import { CATEGORY_NAME_VALIDATOR } from "./category-validator"

export const EVENT_REQUEST_VALIDATOR = z
  .object({
    category: CATEGORY_NAME_VALIDATOR,
    fields: z.record(z.string().or(z.number()).or(z.boolean())).optional(),
    description: z.string().optional(),
  })
  .strict()
