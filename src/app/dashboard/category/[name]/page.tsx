import { notFound } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"

import { db } from "@/db"

import { DashboardWrapper } from "@/components/dashboard-wrapper"
import CategoryContent from "./category-content"

interface CategoryDetailPageProps {
  params: {
    name: string | string[] | undefined
  }
}

export default async function CategoryDetailPage({
  params,
}: CategoryDetailPageProps) {
  const { name } = params

  if (typeof name !== "string") return notFound()

  const auth = await currentUser()
  if (!auth) return notFound()

  const user = await db.user.findUnique({
    where: {
      externalId: auth.id,
    },
  })
  if (!user) return notFound()

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
  if (!category) return notFound()

  const hasEvents = category._count.events > 0

  return (
    <DashboardWrapper title={`${category.emoji} ${category.name} events`}>
      <CategoryContent hasEvents={hasEvents} category={category} />
    </DashboardWrapper>
  )
}
