import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const auth = await currentUser()
  if (!auth) redirect("/sign-in")

  return <div>DashboardPage</div>
}
