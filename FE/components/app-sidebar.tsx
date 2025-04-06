"use client"

import { BarChart3, CheckSquare, Home, MessageSquare, Users, ExternalLink } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const pathname = usePathname()

  const navigation = [
    {
      title: "Main",
      items: [
        {
          title: "Dashboard",
          icon: Home,
          href: "/",
          isActive: pathname === "/",
        },
        {
          title: "Tasks",
          icon: CheckSquare,
          href: "/tasks",
          isActive: pathname === "/tasks",
        },
        {
          title: "Analytics",
          icon: BarChart3,
          href: "/analytics",
          isActive: pathname === "/analytics",
        },
        {
          title: "Team Chat",
          icon: MessageSquare,
          href: "/chat",
          isActive: pathname === "/chat",
        },
      ],
    },
    {
      title: "External",
      items: [
        {
          title: "Slack Workspace",
          icon: ExternalLink,
          href: "https://slack.com",
          external: true,
        },
      ],
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <CheckSquare className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="font-semibold">Task Tracker</div>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive} tooltip={item.title}>
                      {item.external ? (
                        <a href={item.href} target="_blank" rel="noopener noreferrer">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </a>
                      ) : (
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/team">
                    <Users className="h-4 w-4" />
                    <span>Team Members</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

