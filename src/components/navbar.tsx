import React from "react"
import Link from "next/link"
import { SignOutButton } from "@clerk/nextjs"
import { ArrowRight, User2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { MaxWidthWrapper } from "./max-width-wrapper"
import { Button } from "./ui/button"

export const Navbar = () => {
  const user = true

  return (
    <nav className="sticky z-[100] h-16 inset-x-0 top-0 w-full border-b border-gray-200 bg-white/80 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex z-40 font-bold">
            Ping<span className="text-brand-700">Panda</span>
          </Link>
          <div
            className={cn(
              "h-full flex items-center",
              user ? "space-x-4" : "space-x-2"
            )}
          >
            {user ? (
              <>
                <Button size="sm" variant="destructive" asChild>
                  <SignOutButton>Sign Out</SignOutButton>
                </Button>
                <Button
                  size="sm"
                  className="hidden sm:flex items-center gap-1"
                  asChild
                >
                  <Link href="/dashboard">
                    Dashboard <ArrowRight className="ml-1.5 size-4" />
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="ghost" asChild>
                  <Link href="/pricing">Pricing</Link>
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <div className="h-8 w-px bg-gray-200" />
                <Button size="sm" className="flex items-center gap-1.5" asChild>
                  <Link href="/sign-up">
                    <span className="hidden md:block">Sign Up</span>
                    <ArrowRight className="ml-15 size-4 hidden md:block" />
                    <User2 className="ml-15 size-4 md:hidden" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  )
}
