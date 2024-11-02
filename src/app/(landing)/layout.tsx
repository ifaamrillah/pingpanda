import { ReactNode } from "react"

import { Navbar } from "@/components/navbar"

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}
