"use client"

import { useState } from "react"
import { useTeam } from "@/contexts/team-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "./ui/scroll-area"
import { 
  UserCircle, Phone, Mail, Briefcase, Lightbulb, Building2, Users, Award
} from "lucide-react"
import { CreateTeamMemberDialog } from "./create-team-member-dialog"
import { Badge } from "./ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function TeamDashboard() {
  const { teamMembers, isLoading, error, departments, roles } = useTeam()
  const [activeTab, setActiveTab] = useState("members")

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Get team members grouped by department
  const departmentMembers = departments.map(dept => {
    const members = teamMembers.filter(member => member.departmentId === dept.id)
    return {
      ...dept,
      members
    }
  })

  // Get team members grouped by role
  const roleMembers = roles.map(role => {
    const members = teamMembers.filter(member => member.roleId === role.id)
    return {
      ...role,
      members
    }
  })

  const getRoleColor = (roleName: string) => {
    switch(roleName) {
      case "CEO": return "bg-red-500"
      case "CTO": return "bg-blue-500"
      case "R&D Head": return "bg-purple-500"
      case "Content Curator": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
          </TabsList>
          {activeTab === "members" && <CreateTeamMemberDialog />}
        </div>

        <TabsContent value="members" className="mt-0">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                <p>Loading team members...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : teamMembers.length > 0 ? (
                teamMembers.map(member => (
                  <Card key={member.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12 border-2 border-primary">
                            {member.avatar ? <AvatarImage src={member.avatar} /> : null}
                            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{member.name}</CardTitle>
                            <div className="text-sm text-muted-foreground">
                              {member.roleName} • {member.departmentName}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <ScrollArea className="h-48">
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 opacity-70" />
                            <span>{member.email}</span>
                          </div>
                          {member.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 opacity-70" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                          {member.bio && (
                            <div className="flex items-start space-x-2">
                              <UserCircle className="h-4 w-4 opacity-70 mt-0.5" />
                              <p>{member.bio}</p>
                            </div>
                          )}
                          {member.tasks !== undefined && (
                            <div className="flex items-center space-x-2">
                              <Briefcase className="h-4 w-4 opacity-70" />
                              <span>{member.tasks} tasks</span>
                            </div>
                          )}
                          {member.skills && (
                            <div className="flex items-start space-x-2">
                              <Lightbulb className="h-4 w-4 opacity-70 mt-0.5" />
                              <div className="flex flex-wrap gap-1">
                                {member.skills.split(',').map((skill, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {skill.trim()}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p>No team members found.</p>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="departments">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">Departments</h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {departmentMembers.map(dept => (
                <Card key={dept.id}>
                  <CardHeader className="bg-muted/50">
                    <div className="flex items-center space-x-4">
                      <Building2 className="h-8 w-8" />
                      <div>
                        <CardTitle>{dept.name}</CardTitle>
                        <CardDescription>{dept.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{dept.members.length} team members</span>
                      </div>
                      
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="members">
                          <AccordionTrigger>Team Members</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2">
                              {dept.members.length > 0 ? (
                                dept.members.map(member => (
                                  <div key={member.id} className="flex items-center justify-between rounded-md border p-3">
                                    <div className="flex items-center space-x-3">
                                      <Avatar className="h-9 w-9">
                                        {member.avatar ? <AvatarImage src={member.avatar} /> : null}
                                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="text-sm font-medium">{member.name}</p>
                                        <p className="text-xs text-muted-foreground">{member.roleName}</p>
                                      </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">{member.email}</div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground">No members in this department</p>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="roles">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">Roles</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roleMembers.map(role => (
                <Card key={role.id} className="overflow-hidden">
                  <CardHeader className={`${getRoleColor(role.name)} text-white`}>
                    <div className="flex items-center space-x-4">
                      <Award className="h-8 w-8" />
                      <div>
                        <CardTitle>{role.name}</CardTitle>
                        <CardDescription className="text-white/80">{role.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{role.members.length} team members</span>
                      </div>
                      
                      <div className="space-y-2">
                        {role.members.length > 0 ? (
                          role.members.map(member => (
                            <div key={member.id} className="flex items-center justify-between rounded-md border p-3">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-9 w-9">
                                  {member.avatar ? <AvatarImage src={member.avatar} /> : null}
                                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{member.name}</p>
                                  <p className="text-xs text-muted-foreground">{member.departmentName}</p>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">{member.email}</div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No members assigned to this role</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 