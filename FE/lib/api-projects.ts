/**
 * Projects API service
 */

import { fetchApi } from './api-core';
import { ProjectApiResponse } from './types';

// Helper function to refresh analytics after project operations
const refreshAnalytics = () => {
  // Dispatch refresh event for analytics
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('analytics:refresh'));
  }
};

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  teamMembers: number;
}

/**
 * Projects API calls
 */
export const projectsApi = {
  getAll: () => 
    fetchApi<ProjectApiResponse[]>('/projects'),
    
  getById: (id: string) => 
    fetchApi<ProjectApiResponse>(`/projects/${id}`),
    
  getTasks: (id: string) => 
    fetchApi<any[]>(`/projects/${id}/tasks`),
    
  getStats: (id: string) =>
    fetchApi<ProjectStats>(`/projects/${id}/stats`),
    
  getTeam: (id: string) =>
    fetchApi<any[]>(`/projects/${id}/team`),
    
  getByDepartment: (departmentId: string) =>
    fetchApi<ProjectApiResponse[]>(`/projects?departmentId=${departmentId}`),
    
  getByManager: (managerId: string) =>
    fetchApi<ProjectApiResponse[]>(`/projects?managerId=${managerId}`),
    
  search: (query: string) =>
    fetchApi<ProjectApiResponse[]>(`/projects/search?q=${encodeURIComponent(query)}`),
    
  create: async (projectData: {
    name: string;
    description: string;
    status: string;
    priority: string;
    startDate?: string;
    endDate?: string;
    managerId?: string;
    departmentId?: string;
    budget?: string;
    tags?: string;
  }) => {
    const result = await fetchApi<ProjectApiResponse>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    
    refreshAnalytics();
    return result;
  },
    
  update: async (id: string, projectData: {
    name?: string;
    description?: string;
    status?: string;
    priority?: string;
    startDate?: string | null;
    endDate?: string | null;
    managerId?: string | null;
    departmentId?: string | null;
    budget?: string | null;
    tags?: string | null;
  }) => {
    const result = await fetchApi<ProjectApiResponse>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(projectData),
    });
    
    refreshAnalytics();
    return result;
  },
    
  delete: async (id: string) => {
    const result = await fetchApi<{ message: string }>(`/projects/${id}`, {
      method: 'DELETE',
    });
    
    refreshAnalytics();
    return result;
  },
    
  addTeamMember: async (projectId: string, userId: string) => {
    if (!projectId || !userId) {
      throw new Error('Project ID and User ID are required');
    }
    
    // Ensure both IDs are strings, not objects
    const safeProjectId = typeof projectId === 'object' ? 
      (projectId as any).id || String(projectId) : 
      String(projectId);
      
    const safeUserId = typeof userId === 'object' ? 
      (userId as any).id || String(userId) : 
      String(userId);
    
    try {
      console.log(`API: Adding team member ${safeUserId} to project ${safeProjectId}`);
      console.log(`Request URL: /projects/${safeProjectId}/team/${safeUserId}`);
      console.log(`Request method: POST`);
      
      // Make the API call with no body - parameters are in the URL
      const result = await fetchApi<{ message: string }>(`/projects/${safeProjectId}/team/${safeUserId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      refreshAnalytics();
      return result;
    } catch (error) {
      console.error(`Failed to add team member ${safeUserId} to project ${safeProjectId}:`, error);
      throw error;
    }
  },
    
  removeTeamMember: async (projectId: string, userId: string) => {
    const result = await fetchApi<{ message: string }>(`/projects/${projectId}/team/${userId}`, {
      method: 'DELETE',
    });
    
    refreshAnalytics();
    return result;
  },
}; 