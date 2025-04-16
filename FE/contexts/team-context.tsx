"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { toast } from "sonner"

// Import APIs lazily to prevent circular dependencies
let usersApi: any = null;
let departmentsApi: any = null;
let rolesApi: any = null;

if (typeof window !== 'undefined') {
  // Only import on client-side
  import('@/lib/api').then(api => {
    usersApi = api.default?.users || api.usersApi;
    departmentsApi = api.default?.departments || api.departmentsApi;
    rolesApi = api.default?.roles || api.rolesApi;
  });
}

// Interface for departments and roles
export interface Department {
  id: string;
  name: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

// Types
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  roleId?: string | null;      // Store the ID
  roleName?: string;          // Store the display name
  departmentId?: string | null; // Store the ID
  departmentName?: string;      // Store the display name
  avatar?: string | null;
  bio?: string | null;
  phone?: string | null;
  skills?: string | null;
  tasks?: number;
  projects?: number;
}

interface TeamContextType {
  teamMembers: TeamMember[]
  departments: Department[]
  roles: Role[]
  isLoading: boolean
  error: string | null
  refreshTeamMembers: () => Promise<void>
  addTeamMember: (member: {
    name: string;
    email: string;
    roleId?: string | null;
    departmentId?: string | null;
    bio?: string | null;
    phone?: string | null;
    skills?: string | null;
    avatar?: string | null;
  }) => Promise<TeamMember | null>
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
  // Hardcoded departments
  const hardcodedDepartments: Department[] = [
    { id: "dept-1", name: "Development", description: "Software development team" },
    { id: "dept-2", name: "Strategy", description: "Business strategy and planning" },
    { id: "dept-3", name: "Media and Marketing", description: "Media, content, and marketing team" }
  ];

  // Hardcoded roles
  const hardcodedRoles: Role[] = [
    { id: "role-1", name: "CTO", description: "Chief Technology Officer" },
    { id: "role-2", name: "R&D Head", description: "Research and Development Head" },
    { id: "role-3", name: "CEO", description: "Chief Executive Officer" },
    { id: "role-4", name: "Content Curator", description: "Content creation and curation" }
  ];

  // Hardcoded team members
  const hardcodedTeamMembers: TeamMember[] = [
    {
      id: "user-1",
      name: "Pratik Khanapurkar",
      email: "pratik@destinpq.com",
      phone: "7722021968",
      roleId: "role-1",
      roleName: "CTO",
      departmentId: "dept-1",
      departmentName: "Development",
      bio: "Technology leader with expertise in software architecture",
      avatar: null,
      tasks: 12,
      projects: 4
    },
    {
      id: "user-2",
      name: "Shaurya Bansal",
      email: "shauryabansal@destinpq.com",
      phone: "6305918353",
      roleId: "role-2",
      roleName: "R&D Head",
      departmentId: "dept-1",
      departmentName: "Development",
      bio: "Leading research and development initiatives",
      avatar: null,
      tasks: 9,
      projects: 3
    },
    {
      id: "user-3",
      name: "Akanksha Agarwal",
      email: "drakanksha@destinpq.com",
      phone: "998522275",
      roleId: "role-3",
      roleName: "CEO",
      departmentId: "dept-2",
      departmentName: "Strategy",
      bio: "Business strategy and leadership",
      avatar: null,
      tasks: 7,
      projects: 5
    },
    {
      id: "user-4",
      name: "Tejaswi Rangineni",
      email: "tejaswi.rangineni@destinpq.com",
      phone: "9542272969",
      roleId: "role-4",
      roleName: "Content Curator",
      departmentId: "dept-3",
      departmentName: "Media and Marketing",
      bio: "Creating and curating engaging content",
      avatar: null,
      tasks: 14,
      projects: 2
    }
  ];

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(hardcodedTeamMembers);
  const [departments, setDepartments] = useState<Department[]>(hardcodedDepartments);
  const [roles, setRoles] = useState<Role[]>(hardcodedRoles);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // No need to fetch departments and roles since we're using hardcoded data
  const fetchDepartmentsAndRoles = async () => {
    // Just return success since we're using hardcoded data
    return { success: true };
  };

  // Simplified refresh function that just uses our hardcoded data
  const refreshTeamMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Using hardcoded team members data");
      // We're already using hardcoded data, so this is just for show
      setTeamMembers(hardcodedTeamMembers);
    } catch (err: any) {
      console.error("Error in refreshTeamMembers:", err);
      setError("Failed to load team members");
      toast.error("Failed to load team members");
    } finally {
      setIsLoading(false);
    }
  };

  // When departments or roles are loaded or updated, update the team members with names
  useEffect(() => {
    if (teamMembers.length > 0 && (departments.length > 0 || roles.length > 0)) {
      setTeamMembers(prev => prev.map(enhanceTeamMemberWithNames));
    }
  }, [departments, roles]);

  // Function to add a new team member - modified to use our hardcoded data
  const addTeamMember = async (member: {
    name: string;
    email: string;
    roleId?: string | null;
    departmentId?: string | null;
    bio?: string | null;
    phone?: string | null;
    skills?: string | null;
    avatar?: string | null;
  }): Promise<TeamMember | null> => {
    try {
      setIsLoading(true);
      
      // Create a new team member with a generated ID
      const newMember: TeamMember = {
        id: `user-${Date.now()}`,
        name: member.name,
        email: member.email,
        roleId: member.roleId || null,
        departmentId: member.departmentId || null,
        bio: member.bio || null,
        phone: member.phone || null,
        skills: member.skills || null,
        avatar: member.avatar || null,
        tasks: 0,
        projects: 0
      };
      
      // Enhance with department and role names
      const enhancedMember = enhanceTeamMemberWithNames(newMember);
      
      // Update local state
      setTeamMembers(prev => [...prev, enhancedMember]);
      
      // Show success notification
      toast.success(`${member.name} has been added to the team!`);
      
      return enhancedMember;
    } catch (err: any) {
      console.error("Failed to add team member:", err);
      toast.error("Failed to add team member");
      setError("Failed to add team member");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get department and role names by their IDs
  const enhanceTeamMemberWithNames = (member: TeamMember): TeamMember => {
    let departmentName = 'Unknown Department';
    let roleName = 'Unknown Role';
    
    // Check if department ID exists and is valid before looking it up
    if (member.departmentId && typeof member.departmentId === 'string' && member.departmentId.trim() !== '') {
      const department = departments.find(d => d.id === member.departmentId);
      if (department?.name) {
        departmentName = department.name;
      }
    }
    
    // Check if role ID exists and is valid before looking it up
    if (member.roleId && typeof member.roleId === 'string' && member.roleId.trim() !== '') {
      const role = roles.find(r => r.id === member.roleId);
      if (role?.name) {
        roleName = role.name;
      }
    }
    
    return {
      ...member,
      departmentName,
      roleName
    };
  };

  // Function to update a team member
  const updateTeamMember = async (id: string, memberUpdate: Partial<TeamMember>): Promise<TeamMember | null> => {
    try {
      setIsLoading(true);
      
      // Find the member to update
      const existingMember = teamMembers.find(m => m.id === id);
      
      if (!existingMember) {
        throw new Error("Team member not found");
      }
      
      // Create updated member
      const updatedMember: TeamMember = {
        ...existingMember,
        ...memberUpdate
      };
      
      // Enhance with department and role names
      const enhancedMember = enhanceTeamMemberWithNames(updatedMember);
      
      // Update in local state
      setTeamMembers(prev => prev.map(m => m.id === id ? enhancedMember : m));
      
      toast.success(`${enhancedMember.name} has been updated!`);
      return enhancedMember;
    } catch (err: any) {
      console.error("Failed to update team member:", err);
      toast.error("Failed to update team member");
      setError("Failed to update team member");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to delete a team member
  const deleteTeamMember = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Find the member to be deleted
      const deletedMember = teamMembers.find(m => m.id === id);
      
      if (!deletedMember) {
        throw new Error("Team member not found");
      }
      
      // Remove from local state 
      setTeamMembers(prev => prev.filter(m => m.id !== id));
      
      toast.success(`${deletedMember.name} has been removed from the team!`);
      return true;
    } catch (err: any) {
      console.error("Failed to delete team member:", err);
      toast.error("Failed to delete team member");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

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

// Helper type for API responses
interface UserApiResponse {
  id: string;
  name: string;
  email: string;
  roleId: string | null;
  departmentId: string | null;
  avatar?: string | null;
  bio?: string | null;
  phone?: string | null;
  skills?: string | null;
  createdAt: string; 
  updatedAt: string;
}

// Remove the local UpdateUserDto interface definition if it was causing conflicts
/*
interface UpdateUserDto { ... }
*/ 