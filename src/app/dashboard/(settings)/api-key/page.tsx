import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"

import { db } from "@/db"
import { DashboardWrapper } from "@/components/dashboard-wrapper"

import ApiKeySettingsContent from "./api-key-settings-content"

export default async function ApiKeyPage() {
  const auth = await currentUser()

  if (!auth) redirect("/sign-in")

  const user = await db.user.findUnique({
    where: {
      externalId: auth.id,
    },
  })

  if (!user) redirect("/sign-in")

  return (
    <DashboardWrapper title="API Key">
      <ApiKeySettingsContent apiKey={user.apiKey ?? ""} />
    </DashboardWrapper>
  )
}
