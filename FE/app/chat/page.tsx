"use client"

import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TeamChat } from "@/components/team-chat"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTeam } from "@/contexts/team-context"

export default function ChatPage() {
  const { teamMembers, isLoading, error } = useTeam()

  // Function to get avatar initials from name
  const getInitials = (name: string): string => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        heading="Team Chat"
        subheading="Communicate with your team in real-time"
      />
      
      <div className="flex-1 p-8 pt-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Team Chat</CardTitle>
              <CardDescription>Chat with your team members</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <TeamChat />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Online Members</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : error ? (
                  <p className="text-sm text-red-500 p-2">{error}</p>
                ) : teamMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2">No team members found</p>
                ) : (
                  <div className="space-y-4">
                    {teamMembers.slice(0, 5).map((member) => (
                      <div key={member.id} className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="h-9 w-9">
                            {member.avatar && <AvatarImage src={member.avatar} />}
                            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                          </Avatar>
                          <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-1 ring-background"></div>
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.roleName || "Team Member"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>External Chat</CardTitle>
                <CardDescription>Connect to Slack</CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href="https://slack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full p-2 rounded-md bg-[#4A154B] text-white hover:bg-opacity-90 transition-colors"
                >
                  Open Slack Workspace
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

