import Image from "next/image"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"

interface MockDiscordMessageUIProps {
  avatarSrc: string
  avatarAlt: string
  username: string
  timestamp: string
  badgeText?: string
  badgeColor?: string
  title: string
  content: {
    [key: string]: string
  }
}

type BadgeColor = "#43B581" | "#FAA61A" | (string & {})

const getBadgeStyles = (color: BadgeColor) => {
  switch (color) {
    case "#43B581":
      return "bg-green-500/10 text-green-400 ring-green-500/20"
    case "#FAA61A":
      return "bg-yellow-500/10 text-yellow-400 ring-yellow-500/20"
    default:
      return "bg-gray-400/10 text-gray-300 ring-gray-500/20"
  }
}

export const MockDiscordMessageUI = ({
  avatarSrc,
  avatarAlt,
  username,
  timestamp,
  badgeText,
  badgeColor = "#43B581",
  title,
  content,
}: MockDiscordMessageUIProps) => {
  return (
    <div className="w-full flex items-start justify-start">
      <div className="flex items-center mb-2">
        <Image
          src={avatarSrc}
          alt={avatarAlt}
          width={40}
          height={40}
          className="object-cover rounded-full mr-3"
        />
      </div>
      <div className="w-full max-w-xl">
        <div className="flex items-center">
          <p className="font-semibold text-white">{username}</p>
          <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold bg-brand-600 text-white rounded">
            APP
          </span>
          <span className="text-gray-400 ml-1.5 text-xs font-normal">
            {timestamp}
          </span>
        </div>
        <div className="bg-[#2F3136] text-sm w-full rounded p-3 mb-4 mt-1.5">
          <div className="flex flex-row items-center justify-between mr-2">
            {badgeText ? (
              <span
                className={cn(
                  "inline-flex order-2 items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                  getBadgeStyles(badgeColor)
                )}
              >
                {badgeText}
              </span>
            ) : null}
            <p className="text-white order-1 text-base/7 font-semibold">
              {title}
            </p>
          </div>
          {Object.entries(content).map(([key, value]) => (
            <p key={key} className="text-[#DCDDDE] text-sm/6">
              <span className="text-[#B9BBBE]">{key}:</span> {value}
            </p>
          ))}
          <p className="text-[#72767D] text-xs mt-2 flex items-center">
            <Clock className="size-3 mr-1" />
            {timestamp}
          </p>
        </div>
      </div>
    </div>
  )
}
