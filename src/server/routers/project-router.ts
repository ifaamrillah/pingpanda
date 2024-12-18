import { addMonths, startOfMonth } from "date-fns"
import { z } from "zod"

import { db } from "@/db"
import { FREE_QUOTA, PRO_QUOTA } from "@/lib/constants"

import { router } from "../__internals/router"
import { privateProcedure } from "../procedures"

export const projectRouter = router({
  getUsage: privateProcedure.query(async ({ c, ctx }) => {
    const { superjson } = c
    const { user } = ctx

    const currentDate = startOfMonth(new Date())

    const quota = await db.quota.findFirst({
      where: {
        userId: user.id,
        year: currentDate.getFullYear(),
        month: currentDate.getMonth(),
      },
    })

    const eventCount = quota?.count ?? 0

    const categoryCount = await db.eventCategory.count({
      where: { userId: user.id },
    })

    const limits = user.plan === "PRO" ? PRO_QUOTA : FREE_QUOTA

    const resetDate = addMonths(currentDate, 1)

    return superjson({
      categoriesUsed: categoryCount,
      categoriesLimit: limits.maxEventCategories,
      eventsUsed: eventCount,
      eventsLimit: limits.maxEventsPerMonth,
      resetDate,
    })
  }),
  setDiscordId: privateProcedure
    .input(z.object({ discordId: z.string().max(20) }))
    .mutation(async ({ c, ctx, input }) => {
      const { json } = c
      const { user } = ctx
      const { discordId } = input

      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          discordId,
        },
      })

      return json({ success: true })
    }),
})
