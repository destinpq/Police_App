import { Metadata } from "next"
import { PageHeader } from "@/components/page-header"
import { TeamDashboard } from "@/components/team-dashboard"
import { TeamProvider } from "@/contexts/team-context"

export const metadata: Metadata = {
  title: "Team Management",
  description: "View and manage your team members.",
}

export default function TeamPage() {
  return (
    <TeamProvider>
      <div className="flex flex-col h-full">
        <PageHeader
          heading="Team Management"
          subheading="View and manage your team members."
        />
        <div className="flex-1 space-y-8 p-8 pt-6">
          <TeamDashboard />
        </div>
      </div>
    </TeamProvider>
  )
} 