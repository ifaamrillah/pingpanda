import { createCheckoutSession } from "@/lib/stripe"
import { router } from "../__internals/router"
import { privateProcedure } from "../procedures"

export const paymentRouter = router({
  createCheckoutSession: privateProcedure.mutation(async ({ c, ctx }) => {
    const { json } = c
    const { user } = ctx

    const session = await createCheckoutSession({
      userEmail: user.email,
      userId: user.id,
    })

    return json({ url: session.url })
  }),
  getUserPlan: privateProcedure.query(async ({ c, ctx }) => {
    const { json } = c
    const { user } = ctx
    return json({ plan: user.plan })
  }),
})
