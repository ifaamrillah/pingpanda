import { startOfMonth } from "date-fns"
import { z } from "zod"

import { db } from "@/db"
import { EVENT_CATEGORY_VALIDATOR } from "@/lib/validators/category-validator"
import { parseColor } from "@/lib/utils"

import { router } from "../__internals/router"
import { privateProcedure } from "../procedures"

export const categoryRouter = router({
  getEventCategories: privateProcedure.query(async ({ c, ctx }) => {
    const { superjson } = c
    const { user } = ctx

    const categories = await db.eventCategory.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        emoji: true,
        color: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const now = new Date()
        const firstDayOfMonth = startOfMonth(now)

        const [uniqueFieldCount, eventsCount, lastPing] = await Promise.all([
          db.event
            .findMany({
              where: {
                eventCategory: {
                  id: category.id,
                },
                createdAt: {
                  gte: firstDayOfMonth,
                },
              },
              select: {
                fields: true,
              },
              distinct: ["fields"],
            })
            .then((events) => {
              const fieldNames = new Set<string>()
              events.forEach((event) => {
                Object.keys(event.fields as object).forEach((fieldName) => {
                  fieldNames.add(fieldName)
                })
              })
              return fieldNames.size
            }),
          db.event.count({
            where: {
              eventCategory: {
                id: category.id,
              },
              createdAt: {
                gte: firstDayOfMonth,
              },
            },
          }),
          db.event.findFirst({
            where: {
              eventCategory: { id: category.id },
            },
            orderBy: { createdAt: "desc" },
            select: {
              createdAt: true,
            },
          }),
        ])

        return {
          ...category,
          uniqueFieldCount,
          eventsCount,
          lastPing: lastPing?.createdAt || null,
        }
      })
    )

    return superjson({
      categories: categoriesWithCounts,
    })
  }),
  deleteEventCategory: privateProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ c, ctx, input }) => {
      const { json } = c
      const { user } = ctx
      const { name } = input

      await db.eventCategory.delete({
        where: {
          name_userId: {
            name,
            userId: user.id,
          },
        },
      })

      return json({ success: true })
    }),
  createEventCategory: privateProcedure
    .input(EVENT_CATEGORY_VALIDATOR)
    .mutation(async ({ c, ctx, input }) => {
      const { json } = c
      const { user } = ctx
      const { name, color, emoji } = input

      // TODO: ADD PAID PLAN LOGIC

      const eventCategory = await db.eventCategory.create({
        data: {
          name: name.toLowerCase(),
          color: parseColor(color),
          emoji,
          userId: user.id,
        },
      })

      return json({ eventCategory })
    }),
})
