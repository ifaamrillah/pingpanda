import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { Plus } from "lucide-react"

import { db } from "@/db"

import { DashboardWrapper } from "@/components/dashboard-wrapper"
import { DashboardContent } from "./dashboard-content"
import { CreateEventCategoryModal } from "@/components/create-event-category-modal"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const auth = await currentUser()
  if (!auth) redirect("/sign-in")

  const user = await db.user.findUnique({
    where: {
      externalId: auth.id,
    },
  })
  if (!user) redirect("/sign-in")

  return (
    <DashboardWrapper
      title="Dashboard"
      cta={
        <CreateEventCategoryModal>
          <Button>
            <Plus className="size-4 mr-2" />
            Add Category
          </Button>
        </CreateEventCategoryModal>
      }
    >
      <DashboardContent />
    </DashboardWrapper>
  )
}
