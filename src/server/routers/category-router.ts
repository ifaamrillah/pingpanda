import { z } from "zod"
import { startOfDay, startOfMonth, startOfWeek } from "date-fns"
import { HTTPException } from "hono/http-exception"

import { db } from "@/db"
import {
  CATEGORY_NAME_VALIDATOR,
  EVENT_CATEGORY_VALIDATOR,
} from "@/lib/validators/category-validator"
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
  insetQuickstartCategories: privateProcedure.mutation(async ({ c, ctx }) => {
    const { json } = c
    const { user } = ctx

    const categories = await db.eventCategory.createMany({
      data: [
        {
          name: "bug",
          emoji: "🐛",
          color: 0xff6b6b,
        },
        {
          name: "sale",
          emoji: "💰",
          color: 0xffeb3b,
        },
        {
          name: "question",
          emoji: "🤔",
          color: 0x6c5ce7,
        },
      ].map((category) => ({
        ...category,
        userId: user.id,
      })),
    })

    return json({ success: true, count: categories.count })
  }),
  pollCategory: privateProcedure
    .input(z.object({ name: CATEGORY_NAME_VALIDATOR }))
    .query(async ({ c, ctx, input }) => {
      const { json } = c
      const { user } = ctx
      const { name } = input

      const category = await db.eventCategory.findUnique({
        where: {
          name_userId: {
            name,
            userId: user.id,
          },
        },
        include: {
          _count: {
            select: {
              events: true,
            },
          },
        },
      })
      if (!category)
        throw new HTTPException(404, {
          message: `Category "${name}" not found`,
        })

      const hasEvents = category._count.events > 0

      return json({ hasEvents })
    }),
  getEventsByCategoryName: privateProcedure
    .input(
      z.object({
        name: CATEGORY_NAME_VALIDATOR,
        page: z.number(),
        limit: z.number().max(50),
        timeRange: z.enum(["today", "week", "month"]),
      })
    )
    .query(async ({ c, ctx, input }) => {
      const { superjson } = c
      const { user } = ctx
      const { name, page, limit, timeRange } = input

      const now = new Date()

      let startDate: Date

      switch (timeRange) {
        case "today":
          startDate = startOfDay(now)
          break
        case "week":
          startDate = startOfWeek(now, { weekStartsOn: 0 })
          break
        case "month":
          startDate = startOfMonth(now)
          break
      }

      const [events, eventsCount, uniqueFieldCount] = await Promise.all([
        db.event.findMany({
          where: {
            eventCategory: {
              name,
              userId: user.id,
            },
            createdAt: {
              gte: startDate,
            },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
        }),

        db.event.count({
          where: {
            eventCategory: {
              name,
              userId: user.id,
            },
            createdAt: {
              gte: startDate,
            },
          },
        }),

        db.event
          .findMany({
            where: {
              eventCategory: {
                name,
                userId: user.id,
              },
              createdAt: {
                gte: startDate,
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
              Object.keys(event.fields as object).forEach((fieldName) =>
                fieldNames.add(fieldName)
              )
            })

            return fieldNames.size
          }),
      ])

      return superjson({
        events,
        eventsCount,
        uniqueFieldCount,
      })
    }),
})
