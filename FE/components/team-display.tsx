"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeamMemberList } from "@/components/team-member-list" // Assuming this component exists and works
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import type { TeamMember, Department, Role } from "@/contexts/team-context"; // Use types from context or define locally
import { usersApi } from "@/lib/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"; // Import Button

// Define Department and Role interfaces locally if not imported reliably
// interface Department { id: string; name: string; }
// interface Role { id: string; name: string; }

interface TeamDisplayProps {
  initialTeamMembers: TeamMember[];
  initialDepartments: Department[];
  initialRoles: Role[];
  initialError: string | null;
}

export function TeamDisplay({
  initialTeamMembers,
  initialDepartments,
  initialRoles,
  initialError
}: TeamDisplayProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [departments] = useState<Department[]>(initialDepartments);
  const [roles] = useState<Role[]>(initialRoles);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(initialError);
  const [view, setView] = useState<"cards" | "list">("list")

  useEffect(() => {
    console.log("[Client] Initialized TeamDisplay:", {
      teamMembers: teamMembers.length,
      departments: departments.length,
      roles: roles.length,
      error
    });
    if (initialError) {
        toast.error(`Initial data load failed: ${initialError}`);
    }
  }, [initialError]); // Add initialError dependency

  // Enhance member with names (ensure consistency with server version)
  const enhanceMemberClientSide = (member: any): TeamMember => {
    const deptId = member.departmentId || member.department?.id;
    const roleId = member.roleId || member.role?.id;
    const department = departments.find(d => d.id === deptId);
    const role = roles.find(r => r.id === roleId);
    return {
      ...member,
      departmentName: department?.name || 'Unknown Department',
      roleName: role?.name || 'Unknown Role',
      tasks: member.tasks ?? 0,
      projects: member.projects ?? 0,
    } as TeamMember;
  };

  // Refresh data client-side
  const refreshClientData = async () => {
    setIsLoading(true);
    setError(null);
    console.log("[Client] Refreshing team members...");
    try {
      // Fetch users, departments, and roles again
      const [usersData, departmentsData, rolesData] = await Promise.all([
          usersApi.getAll(),
          api.departments.getAll(), // Use departments API
          api.roles.getAll()        // Use roles API
      ]);
      console.log(`[Client] Refreshed: ${usersData.length} users, ${departmentsData.length} departments, ${rolesData.length} roles`);
      // Update local state for deps/roles if needed, though usually static
      // setDepartments(departmentsData);
      // setRoles(rolesData);
      const enhancedUsers = usersData.map(user => {
         const dept = departmentsData.find(d => d.id === (user as any).departmentId);
         const role = rolesData.find(r => r.id === (user as any).roleId);
         return {
             ...user,
             departmentName: dept?.name || 'Unknown Department',
             roleName: role?.name || 'Unknown Role',
             tasks: user.tasks ?? Math.floor(Math.random() * 20), // Use existing or fallback mock
             projects: user.projects ?? Math.floor(Math.random() * 5), // Use existing or fallback mock
         } as TeamMember;
      });
      setTeamMembers(enhancedUsers);
      toast.success("Team data refreshed");
    } catch (err: any) {
      console.error("[Client] Error refreshing team data:", err);
      const errorMessage = err.message || "Failed to refresh team data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder handlers - Actual API calls likely happen in dialogs/modals
  // These handlers update the *client* state after a successful API call elsewhere
  const handleMemberCreated = (newMemberData: TeamMember) => {
    console.log("[Client] Team member created event:", newMemberData);
    setTeamMembers(prev => [...prev, enhanceMemberClientSide(newMemberData)]);
    toast.info("New member added to list.");
  };
  const handleMemberDeleted = (memberId: string) => {
    console.log("[Client] Team member deleted event:", memberId);
    setTeamMembers(prev => prev.filter(m => m.id !== memberId));
    toast.info("Member removed from list.");
  };
  const handleMemberUpdated = (updatedMemberData: TeamMember) => {
    console.log("[Client] Team member updated event:", updatedMemberData);
    const enhancedMember = enhanceMemberClientSide(updatedMemberData);
    setTeamMembers(prev =>
      prev.map(m => m.id === enhancedMember.id ? enhancedMember : m)
    );
     toast.info("Member details updated in list.");
  };

  // Get initials
  const getInitials = (name: string): string => {
    if (!name) return "?";
    return name.split(' ').map(n => n?.[0] ?? '').join('').toUpperCase()
  }

  // Render Logic
  return (
    <div className="w-full">
      {error && !isLoading && (
        <div className="p-4 mb-4 text-center text-red-600 bg-red-100 border border-red-300 rounded">
          <p>Error: {error}</p>
          <Button
            onClick={refreshClientData}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            size="sm" // Explicit size
            variant="destructive" // Correct variant
          >
            Try Again
          </Button>
        </div>
      )}

      <Button
        onClick={refreshClientData}
        disabled={isLoading}
        className={`mb-4 px-4 py-2 bg-primary/10 text-primary rounded hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed ${isLoading ? 'animate-pulse' : ''}`}
        variant="outline" // Use outline or secondary
        size="sm"
      >
        {isLoading ? "Refreshing..." : "Refresh Data"}
      </Button>

      <Tabs value={view} onValueChange={(value) => setView(value as "cards" | "list")} className="w-full">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="cards">Card View</TabsTrigger>
        </TabsList>

        {/* List View Tab */}
        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage your team members and their roles</CardDescription>
            </CardHeader>
            <CardContent>
               {isLoading && teamMembers.length === 0 ? (
                 <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>
               ) : !isLoading && teamMembers.length === 0 && !error ? (
                 <div className="text-center py-10 text-muted-foreground">No team members found.</div>
               ): (
                <TeamMemberList
                  initialMembers={teamMembers} // Use client-side state
                  onMemberAdded={handleMemberCreated}
                  onMemberDeleted={handleMemberDeleted}
                  onMemberUpdated={handleMemberUpdated}
                  departments={departments} // Pass static lists
                  roles={roles}             // Pass static lists
                />
               )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Card View Tab */}
        <TabsContent value="cards" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {isLoading && teamMembers.length === 0 ? (
              <div className="col-span-full flex justify-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary\"></div>
              </div>
            ) : !isLoading && teamMembers.length === 0 && !error ? (
              <div className="col-span-full text-center py-10">
                <h3 className="text-lg font-medium\">No team members found</h3>
                <p className="text-muted-foreground mt-2\">Add team members via the Admin section.</p>
              </div>
            ) : (
              teamMembers.map((member) => (
                <Card key={member.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-14 w-14">
                        {member.avatar ? (
                          <AvatarImage src={member.avatar} alt={member.name || 'User Avatar'} />
                        ) : null}
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{member.name || "Unnamed User"}</CardTitle>
                        <CardDescription>{member.roleName || "Team Member"}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{member.email || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tasks:</span>
                        <span>{member.tasks ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Projects:</span>
                        <span>{member.projects ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Department:</span>
                        <span>{member.departmentName || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Role:</span>
                        <span>{member.roleName || 'Unknown'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Need to import api if not already
import api from "@/lib/api";
