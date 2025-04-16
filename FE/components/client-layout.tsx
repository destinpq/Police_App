"use client"

import React, { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TeamProvider } from "@/contexts/team-context"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "sonner"

// Create a loading fallback for suspense
function LoadingFallback() {
  return <div className="flex justify-center items-center min-h-screen">Loading...</div>
}

// Use dynamic import for the error interceptor to avoid circular dependencies
const ApiErrorInterceptorLoader = React.lazy(() => 
  import('@/lib/api-interceptor').then(mod => ({ default: mod.ApiErrorInterceptor }))
)

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="task-tracker-theme"
    >
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <ApiErrorInterceptorLoader />
        </Suspense>
        <TeamProvider>
          <SidebarProvider>
            <div className="flex min-h-screen">
              <AppSidebar />
              <main className="flex-1">{children}</main>
            </div>
            <Toaster position="top-right" />
          </SidebarProvider>
        </TeamProvider>
      </AuthProvider>
    </ThemeProvider>
  )
} 