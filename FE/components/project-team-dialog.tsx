"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Plus, X, UserPlus, Search } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import { useTeam } from "@/contexts/team-context"

interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string | null
}

interface ProjectTeamDialogProps {
  projectId: string
  onTeamUpdated?: () => void
}

export function ProjectTeamDialog({ projectId, onTeamUpdated }: ProjectTeamDialogProps) {
  const [open, setOpen] = useState(false)
  const [projectTeam, setProjectTeam] = useState<TeamMember[]>([])
  const [isLoadingTeam, setIsLoadingTeam] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredTeamMembers, setFilteredTeamMembers] = useState<TeamMember[]>([])
  const { teamMembers } = useTeam()
  
  useEffect(() => {
    if (open) {
      loadProjectTeam()
    }
  }, [open, projectId])
  
  useEffect(() => {
    if (teamMembers.length > 0 && projectTeam.length >= 0) {
      // Filter out team members who are already on the project
      const projectTeamIds = new Set(projectTeam.map(member => member.id))
      const availableMembers = teamMembers
        .filter(member => !projectTeamIds.has(member.id))
        .map(member => ({
          id: member.id,
          name: member.name,
          email: member.email,
          avatar: member.avatar
        }))
      
      // Filter based on search query
      const filtered = searchQuery
        ? availableMembers.filter(member => 
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : availableMembers
      
      setFilteredTeamMembers(filtered)
    }
  }, [teamMembers, projectTeam, searchQuery])

  // Load project team without making real API calls
  const loadProjectTeam = async () => {
    try {
      setIsLoadingTeam(true)
      
      // Simulate loading time for more realistic UI
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // In a real implementation, we would load the actual project team from an API
      // For now, we'll just use an empty array or initialize with a sample member
      
      // Uncomment the following to have a sample project team member
      // const sampleTeamMember = teamMembers.find(m => m.id === "user-1"); // Pratik as default team member
      // setProjectTeam(sampleTeamMember ? [{
      //   id: sampleTeamMember.id,
      //   name: sampleTeamMember.name,
      //   email: sampleTeamMember.email,
      //   avatar: sampleTeamMember.avatar
      // }] : []);
      
      setProjectTeam([]);
    } catch (error) {
      console.error("Failed to load project team:", error)
      toast.error("Failed to load project team")
    } finally {
      setIsLoadingTeam(false)
    }
  }

  const addTeamMember = async (userId: string) => {
    try {
      // Validate inputs
      if (!projectId || !userId) {
        toast.error("Missing project ID or user ID");
        return;
      }
      
      console.log(`Adding team member ${userId} to project ${projectId}`);
      
      // Find the team member in our hardcoded list
      const newMember = teamMembers.find(m => m.id === userId);
      
      if (!newMember) {
        throw new Error("Team member not found");
      }
      
      // Update local state without making an API call
      setProjectTeam(prev => [...prev, {
        id: newMember.id,
        name: newMember.name,
        email: newMember.email,
        avatar: newMember.avatar
      }]);
      
      console.log("Team member added to project team:", newMember.name);
      toast.success(`${newMember.name} added to project team`);
      
      // Notify parent component
      if (onTeamUpdated) {
        onTeamUpdated();
      }
    } catch (error: any) {
      console.error("Failed to add team member:", error);
      toast.error(error.message || "Failed to add team member to project");
    }
  }

  const removeTeamMember = async (userId: string) => {
    try {
      // Update local state without making an API call
      const memberToRemove = projectTeam.find(m => m.id === userId);
      
      if (!memberToRemove) {
        throw new Error("Team member not found in project");
      }
      
      setProjectTeam(prev => prev.filter(member => member.id !== userId));
      
      toast.success(`${memberToRemove.name} removed from project`);
      
      // Notify parent component
      if (onTeamUpdated) {
        onTeamUpdated();
      }
    } catch (error: any) {
      console.error("Failed to remove team member:", error);
      toast.error(error.message || "Failed to remove team member from project");
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="mr-2 h-4 w-4" />
          Manage Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Project Team Members</DialogTitle>
          <DialogDescription>
            Add or remove team members from this project.
          </DialogDescription>
        </DialogHeader>
        
        {/* Current Team Members */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Current Team</h3>
          {isLoadingTeam ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : projectTeam.length > 0 ? (
            <div className="rounded-md border divide-y">
              {projectTeam.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-9 w-9">
                      {member.avatar ? <AvatarImage src={member.avatar} /> : null}
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeTeamMember(member.id)}
                    title="Remove from project"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border rounded-md p-8 text-center">
              <p className="text-sm text-muted-foreground">No team members assigned to this project yet.</p>
            </div>
          )}
          
          {/* Add Team Members */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-2">Add Team Members</h3>
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email"
                className="pl-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            
            {filteredTeamMembers.length > 0 ? (
              <div className="rounded-md border divide-y max-h-[300px] overflow-y-auto">
                {filteredTeamMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-9 w-9">
                        {member.avatar ? <AvatarImage src={member.avatar} /> : null}
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => addTeamMember(member.id)}
                      title="Add to project"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="border rounded-md p-8 text-center">
                <p className="text-sm text-muted-foreground">No team members found matching your search.</p>
              </div>
            ) : (
              <div className="border rounded-md p-8 text-center">
                <p className="text-sm text-muted-foreground">No additional team members available to add.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 