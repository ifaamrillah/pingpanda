"use client"

import { useQuery } from "@tanstack/react-query"
import { EventCategory } from "@prisma/client"

import { EmptyCategoryState } from "./empty-category-state"

interface CategoryContentProps {
  hasEvents: boolean
  category: EventCategory
}

const CategoryContent = ({
  hasEvents: initialHasEvents,
  category,
}: CategoryContentProps) => {
  const { data: pollingData } = useQuery({
    queryKey: ["category", category.name, "hasEvents"],
    initialData: { hasEvents: initialHasEvents },
  })

  if (!pollingData.hasEvents) {
    return <EmptyCategoryState categoryName={category.name} />
  }
}

export default CategoryContent
