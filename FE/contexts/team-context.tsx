"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import api from "@/lib/api"
import { toast } from "sonner"

// Interface for departments and roles
interface Department {
  id: string;
  name: string;
  description?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
}

// Types
export interface TeamMember {
  id: string
  name: string
  email: string
  role?: string       // ID reference to a role
  roleName?: string   // Display name of the role
  department?: string // ID reference to a department
  departmentName?: string // Display name of the department
  avatar?: string
  bio?: string
  phone?: string
  skills?: string
  tasks?: number
  projects?: number
}

interface TeamContextType {
  teamMembers: TeamMember[]
  departments: Department[]
  roles: Role[]
  isLoading: boolean
  error: string | null
  refreshTeamMembers: () => Promise<void>
  addTeamMember: (member: Omit<TeamMember, "id">) => Promise<TeamMember | null>
  updateTeamMember: (id: string, member: Partial<TeamMember>) => Promise<TeamMember | null>
  deleteTeamMember: (id: string) => Promise<boolean>
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

export function useTeam() {
  const context = useContext(TeamContext)
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider")
  }
  return context
}

export function TeamProvider({ children }: { children: ReactNode }) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch team members, departments and roles on initial load
  useEffect(() => {
    refreshTeamMembers()
    fetchDepartmentsAndRoles()
  }, [])

  // Function to fetch departments and roles
  const fetchDepartmentsAndRoles = async () => {
    try {
      // Fetch departments
      const departmentsData = await api.departments.getAll();
      setDepartments(departmentsData);

      // Fetch roles
      const rolesData = await api.roles.getAll();
      setRoles(rolesData);
    } catch (error) {
      console.error("Error fetching departments or roles:", error);
    }
  };

  // Function to get department and role names by their IDs
  const enhanceTeamMemberWithNames = (member: TeamMember): TeamMember => {
    const department = departments.find(d => d.id === member.department);
    const role = roles.find(r => r.id === member.role);
    
    return {
      ...member,
      departmentName: department?.name,
      roleName: role?.name
    };
  };

  // Function to refresh team members data
  const refreshTeamMembers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await api.teamMembers.getAll()
      
      // Add task and project counts
      const enhancedData = data.map(member => ({
        ...member,
        tasks: Math.floor(Math.random() * 20), // Would be replaced with actual task counts
        projects: Math.floor(Math.random() * 5), // Would be replaced with actual project counts
      }))
      
      setTeamMembers(enhancedData)

      // Update department and role names if we have them
      if (departments.length > 0 && roles.length > 0) {
        setTeamMembers(prev => prev.map(enhanceTeamMemberWithNames));
      }
    } catch (err: any) {
      console.error("Failed to fetch team members:", err)
      setError(err?.message || "Failed to fetch team members")
      toast.error("Failed to load team members")
    } finally {
      setIsLoading(false)
    }
  }

  // When departments or roles are loaded or updated, update the team members with names
  useEffect(() => {
    if (teamMembers.length > 0 && (departments.length > 0 || roles.length > 0)) {
      setTeamMembers(prev => prev.map(enhanceTeamMemberWithNames));
    }
  }, [departments, roles]);

  // Function to add a new team member
  const addTeamMember = async (member: Omit<TeamMember, "id">): Promise<TeamMember | null> => {
    try {
      setIsLoading(true)
      
      // Prepare the member data to match the API expectations
      // The API requires role and department to be strings
      const memberData = {
        name: member.name,
        email: member.email,
        role: member.role || "",
        department: member.department || "",
        bio: member.bio,
        phone: member.phone,
        skills: member.skills,
        avatar: member.avatar
      };
      
      const newMember = await api.teamMembers.create(memberData)
      
      // Add the new member to the local state with additional fields from the form
      const enhancedMember = {
        ...newMember,
        role: member.role,
        department: member.department,
        bio: member.bio,
        phone: member.phone,
        skills: member.skills,
        avatar: member.avatar,
        tasks: 0,
        projects: 0
      }
      
      setTeamMembers(prev => [...prev, enhancedMember])
      toast.success(`${member.name} has been added to the team!`)
      return enhancedMember
    } catch (err: any) {
      console.error("Failed to add team member:", err)
      toast.error("Failed to add team member")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Function to update a team member
  const updateTeamMember = async (id: string, member: Partial<TeamMember>): Promise<TeamMember | null> => {
    try {
      setIsLoading(true)
      const response = await api.teamMembers.update(id, member)
      
      // The API returns { message: string; user: any }, so we need to extract the user
      const updatedMember = response.user as TeamMember
      
      // Update the member in local state
      setTeamMembers(prev => 
        prev.map(m => m.id === id ? { ...m, ...updatedMember } : m)
      )
      
      toast.success(`${member.name || 'Team member'} has been updated!`)
      return updatedMember
    } catch (err: any) {
      console.error("Failed to update team member:", err)
      toast.error("Failed to update team member")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Function to delete a team member
  const deleteTeamMember = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      await api.teamMembers.delete(id)
      
      // Remove the member from local state
      const deletedMember = teamMembers.find(m => m.id === id)
      setTeamMembers(prev => prev.filter(m => m.id !== id))
      
      toast.success(`${deletedMember?.name || 'Team member'} has been removed!`)
      return true
    } catch (err: any) {
      console.error("Failed to delete team member:", err)
      toast.error("Failed to delete team member")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    teamMembers,
    departments,
    roles,
    isLoading,
    error,
    refreshTeamMembers,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember
  }

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>
} 