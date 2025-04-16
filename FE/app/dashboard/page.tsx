"use client"

import { useState, useEffect } from "react"
import { useTeam } from "@/contexts/team-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TeamMemberCard } from "@/components/team-member-card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { teamMembers, isLoading } = useTeam()
  const [keyTeamMembers, setKeyTeamMembers] = useState<any[]>([])
  
  // Filter for key team members
  useEffect(() => {
    if (teamMembers.length > 0) {
      // Get key team members by name
      const teamLeads = teamMembers.filter(
        member => 
          member.name === "Pratik Khanapurkar" || 
          member.name === "Shaurya Bansal" || 
          member.name === "Akanksha Agarwal" ||
          member.name === "Tejaswi Rangineni"
      )
      setKeyTeamMembers(teamLeads)
    }
  }, [teamMembers])

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Key Team Members</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {keyTeamMembers.map(member => (
                <TeamMemberCard key={member.id} member={member} showActions={false} />
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Organizational Overview</CardTitle>
              <CardDescription>Key metrics and information about your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="text-lg font-medium">Team Size</h3>
                  <p className="text-3xl font-bold">{teamMembers.length}</p>
                  <p className="text-sm text-muted-foreground">Active members</p>
                </div>
                
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="text-lg font-medium">Total Projects</h3>
                  <p className="text-3xl font-bold">7</p>
                  <p className="text-sm text-muted-foreground">Active projects</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 