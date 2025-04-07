"use client"

import { BarChart3, CheckSquare, Home, MessageSquare, Users, ExternalLink, Building2, ShieldCheck } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { LucideIcon } from "lucide-react"

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

// Define types for navigation items
type NavigationItemBase = {
  title: string;
  icon: LucideIcon;
  href: string;
};

type InternalNavigationItem = NavigationItemBase & {
  isActive: boolean;
  external?: never;
};

type ExternalNavigationItem = NavigationItemBase & {
  external: boolean;
  isActive?: never;
};

type NavigationItem = InternalNavigationItem | ExternalNavigationItem;

type NavigationGroup = {
  title: string;
  items: NavigationItem[];
};

export function AppSidebar() {
  const pathname = usePathname()

  const navigation: NavigationGroup[] = [
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
      title: "Admin",
      items: [
        {
          title: "Team Members",
          icon: Users,
          href: "/team",
          isActive: pathname === "/team",
        },
        {
          title: "Departments",
          icon: Building2,
          href: "/admin/departments",
          isActive: pathname.includes('/admin/departments'),
        },
        {
          title: "Roles",
          icon: ShieldCheck,
          href: "/admin/roles",
          isActive: pathname.includes('/admin/roles'),
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
                    <SidebarMenuButton asChild isActive={!!item.isActive} tooltip={item.title}>
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
      <SidebarRail />
    </Sidebar>
  )
}

