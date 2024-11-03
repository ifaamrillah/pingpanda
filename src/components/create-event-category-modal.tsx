"use client"

import { PropsWithChildren, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  EVENT_CATEGORY_VALIDATOR,
  EventCategoryForm,
} from "@/lib/validators/category-validator"
import { cn } from "@/lib/utils"
import { client } from "@/lib/client"

import { Modal } from "./ui/modal"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Button } from "./ui/button"

const COLOR_OPTIONS = [
  "#FF6B6B", // bg-[#FF6B6B] ring-[#FF6B6B] Bright Red
  "#4ECDC4", // bg-[#4ECDC4] ring-[#4ECDC4] Teal
  "#45B7D1", // bg-[#45B7D1] ring-[#45B7D1] Sky Blue
  "#FFA07A", // bg-[#FFA07A] ring-[#FFA07A] Light Salmon
  "#98D8C8", // bg-[#98D8C8] ring-[#98D8C8] Seafoam Green
  "#FDCB6E", // bg-[#FDCB6E] ring-[#FDCB6E] Mustard Yellow
  "#6C5CE7", // bg-[#6C5CE7] ring-[#6C5CE7] Soft Purple
  "#FF85A2", // bg-[#FF85A2] ring-[#FF85A2] Pink
  "#2ECC71", // bg-[#2ECC71] ring-[#2ECC71] Emerald Green
  "#E17055", // bg-[#E17055] ring-[#E17055] Terracotta
]

const EMOJI_OPTIONS = [
  { emoji: "💰", label: "Money (Sale)" },
  { emoji: "👤", label: "User (Sign-up)" },
  { emoji: "🎉", label: "Celebration" },
  { emoji: "📅", label: "Calendar" },
  { emoji: "🚀", label: "Launch" },
  { emoji: "📢", label: "Announcement" },
  { emoji: "🎓", label: "Graduation" },
  { emoji: "🏆", label: "Achievement" },
  { emoji: "💡", label: "Idea" },
  { emoji: "🔔", label: "Notification" },
]

export const CreateEventCategoryModal = ({
  children,
  ...props
}: PropsWithChildren) => {
  const queryClient = useQueryClient()
  const [isOpen, setOpen] = useState<boolean>(false)

  const { mutate: createCategory, isPending: isCreateCategoryLoading } =
    useMutation({
      mutationFn: async (data: EventCategoryForm) => {
        await client.category.createEventCategory.$post(data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["user-event-categories"] })
        setOpen(false)
      },
    })

  const {
    watch,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<EventCategoryForm>({
    resolver: zodResolver(EVENT_CATEGORY_VALIDATOR),
  })

  const selectedColor = watch("color")
  const selectedEmoji = watch("emoji")

  const onSubmit = (data: EventCategoryForm) => {
    createCategory(data)
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>

      <Modal className="max-w-xl p-8" showModal={isOpen} setShowModal={setOpen}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h2 className="text-lg/7 font-medium tracking-tight text-gray-950">
              New Event Category
            </h2>
            <p className="text-sm/6 text-gray-600">
              Create a new category to organize your events.
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                autoFocus
                id="name"
                {...register("name")}
                placeholder="e.g. user-signup"
                className="w-full"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex flex-wrap gap-3">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      `bg-[${color}]`,
                      "size-10 rounded-full ring-2 transition-all",
                      selectedColor === color
                        ? "ring-brand-700 scale-110"
                        : "ring-transparent hover:scale-110"
                    )}
                    onClick={() => setValue("color", color)}
                  ></button>
                ))}
              </div>
              {errors.color && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.color.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Emoji</Label>
              <div className="flex flex-wrap gap-3">
                {EMOJI_OPTIONS.map(({ emoji, label }) => (
                  <button
                    key={emoji}
                    type="button"
                    className={cn(
                      "size-10 flex items-center justify-center text-xl rounded-md transition-all",
                      selectedEmoji === emoji
                        ? "bg-brand-100 ring-2 ring-brand-700 scale-110"
                        : "bg-brand-100 hover:bg-brand-200"
                    )}
                    onClick={() => setValue("emoji", emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {errors.emoji && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.emoji.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isCreateCategoryLoading ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
