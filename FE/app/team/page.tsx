"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeamMemberList } from "@/components/team-member-list"
import { useTeam, TeamMember } from "@/contexts/team-context"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function TeamPage() {
  const { teamMembers, isLoading, error, refreshTeamMembers } = useTeam()
  const [view, setView] = useState<"cards" | "list">("list")

  // Get initials from name
  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  // Handle creating a new team member - the context manages all state
  const handleMemberCreated = (memberData: any) => {
    // Team context already handled adding the member to the state
    console.log("Team member created:", memberData)
    refreshTeamMembers()
  }

  // Handle deleting a team member
  const handleMemberDeleted = (memberId: string) => {
    console.log("Team member deleted:", memberId)
    refreshTeamMembers()
  }

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Team</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">
          <p>Error loading team members: {error}</p>
          <button 
            onClick={() => refreshTeamMembers()} 
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      ) : (
        <Tabs defaultValue="list" className="w-full">
          <TabsList>
            <TabsTrigger value="list" onClick={() => setView("list")}>List View</TabsTrigger>
            <TabsTrigger value="cards" onClick={() => setView("cards")}>Card View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage your team members and their roles</CardDescription>
              </CardHeader>
              <CardContent>
                <TeamMemberList 
                  initialMembers={teamMembers} 
                  onMemberAdded={handleMemberCreated}
                  onMemberDeleted={handleMemberDeleted}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="cards" className="mt-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {teamMembers.length === 0 ? (
                <div className="col-span-full text-center py-10">
                  <h3 className="text-lg font-medium">No team members found</h3>
                  <p className="text-muted-foreground mt-2">Add your first team member to get started.</p>
                </div>
              ) : (
                teamMembers.map((member) => (
                  <Card key={member.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-14 w-14">
                          {member.avatar ? (
                            <AvatarImage src={member.avatar} alt={member.name} />
                          ) : null}
                          <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{member.name}</CardTitle>
                          <CardDescription>{member.roleName || member.role || "Team Member"}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{member.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tasks:</span>
                          <span>{member.tasks || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Projects:</span>
                          <span>{member.projects || 0}</span>
                        </div>
                        {member.department && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Department:</span>
                            <span>{member.departmentName || member.department}</span>
                          </div>
                        )}
                        {member.role && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Role:</span>
                            <span>{member.roleName || member.role}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
} 