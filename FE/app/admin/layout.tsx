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
  
  const navItems = [
    {
      name: "Departments",
      href: "/admin/departments",
      icon: Building2,
      isActive: pathname.includes('/admin/departments'),
    },
    {
      name: "Roles",
      href: "/admin/roles",
      icon: ShieldCheck,
      isActive: pathname.includes('/admin/roles'),
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="container flex h-16 items-center px-4">
          <div className="mr-4 font-bold text-lg">Admin Dashboard</div>
        </div>
      </div>
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block border-r">
          <div className="h-full py-6 pr-2 lg:py-8">
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent ${
                    item.isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                  {item.isActive && (
                    <ChevronRight className="ml-auto h-4 w-4" />
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
        <main className="flex flex-col flex-1 w-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
} 