import { ReactNode } from "react"

import { Navbar } from "@/components/navbar"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}
