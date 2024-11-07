import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"

import { db } from "@/db"
import { DashboardWrapper } from "@/components/dashboard-wrapper"

import UpgradeContent from "./upgrade-content"

export default async function UpgradePage() {
  const auth = await currentUser()

  if (!auth) redirect("/sign-in")

  const user = await db.user.findUnique({
    where: {
      externalId: auth.id,
    },
  })

  if (!user) redirect("/sign-in")

  return (
    <DashboardWrapper title="Pro Membership">
      <UpgradeContent plan={user.plan} />
    </DashboardWrapper>
  )
}
