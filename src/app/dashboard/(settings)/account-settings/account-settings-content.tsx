"use client"

import { useState } from "react"
import Link from "next/link"
import { useMutation } from "@tanstack/react-query"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

import { client } from "@/lib/client"
import { Button } from "@/components/ui/button"

const AccountSettingsContent = ({
  discordId: initialDiscordId,
}: {
  discordId: string
}) => {
  const [discordId, setDiscordId] = useState(initialDiscordId)

  const { mutate, isPending } = useMutation({
    mutationFn: async (discordId: string) => {
      const res = await client.project.setDiscordId.$post({ discordId })
      return await res.json()
    },
  })

  return (
    <Card className="max-w-xl w-full space-y-4">
      <div>
        <Label>Discord ID</Label>
        <Input
          className="mt-1"
          value={discordId}
          onChange={(e) => setDiscordId(e.target.value)}
          placeholder="Enter your Discord ID"
        />
      </div>

      <p className="t-2 text-sm/6 text-gray-600">
        Don&apos;t know how to find your Discord ID?{" "}
        <Link
          href="https://support.playhive.com/discord-user-id/"
          className="text-brand-600 hover:text-brand-500"
        >
          Learn how to obtain it here.
        </Link>
      </p>

      <div className="pt-4">
        <Button onClick={() => mutate(discordId)} disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </Card>
  )
}

export default AccountSettingsContent
