"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Building2, 
  ShieldCheck,
  ChevronRight 
} from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="container flex h-16 items-center px-4">
          <div className="mr-4 font-bold text-lg">Admin Dashboard</div>
        </div>
      </div>
      <div className="container flex-1">
        <main className="flex flex-col flex-1 w-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
} 