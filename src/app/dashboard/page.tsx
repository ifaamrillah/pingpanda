import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { Plus } from "lucide-react"

import { db } from "@/db"

import { DashboardWrapper } from "@/components/dashboard-wrapper"
import { DashboardContent } from "./dashboard-content"
import { CreateEventCategoryModal } from "@/components/create-event-category-modal"
import { Button } from "@/components/ui/button"
import { PaymentSuccessModal } from "@/components/payment-success-modal"
import { createCheckoutSession } from "@/lib/stripe"

interface DashboardPageProps {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const auth = await currentUser()
  if (!auth) redirect("/sign-in")

  const user = await db.user.findUnique({
    where: {
      externalId: auth.id,
    },
  })
  if (!user) redirect("/sign-in")

  const intent = searchParams.intent
  if (intent === "upgrade") {
    const session = await createCheckoutSession({
      userEmail: user.email,
      userId: user.id,
    })

    if (session.url) redirect(session.url)
  }

  const success = searchParams.success

  return (
    <>
      {success ? <PaymentSuccessModal /> : null}
      <DashboardWrapper
        title="Dashboard"
        cta={
          <CreateEventCategoryModal>
            <Button className="w-full sm:w-fit">
              <Plus className="size-4 mr-2" />
              Add Category
            </Button>
          </CreateEventCategoryModal>
        }
      >
        <DashboardContent />
      </DashboardWrapper>
    </>
  )
}
