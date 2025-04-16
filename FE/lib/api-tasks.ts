/**
 * Tasks API service
 */

import { fetchApi } from './api-core';
import { Task, TaskFormData, TaskApiResponse } from './types';
import { adaptFormToTask } from './task-adapter';

// Helper function to refresh analytics after task operations
const refreshAnalytics = () => {
  // Dispatch refresh event for analytics
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('analytics:refresh'));
  }
};

/**
 * Tasks API calls
 */
export const tasksApi = {
  getAll: () => fetchApi<TaskApiResponse[]>('/tasks'),

  getById: (id: string) => fetchApi<TaskApiResponse>(`/tasks/${id}`),

  getByProject: (projectId: string) => fetchApi<TaskApiResponse[]>(`/projects/${projectId}/tasks`),

  getByUser: (userId: string) => fetchApi<TaskApiResponse[]>(`/users/${userId}/tasks`),
  
  getByAssignee: (assigneeId: string) =>
    fetchApi<TaskApiResponse[]>(`/tasks?assigneeId=${assigneeId}`),
    
  getByStatus: (status: string) =>
    fetchApi<TaskApiResponse[]>(`/tasks?status=${status}`),
    
  create: async (taskData: TaskFormData) => {
    // Convert the form data to the API format
    const apiTask = adaptFormToTask(taskData);
    
    console.log('Sending to API endpoint:', apiTask);
    
    // Make sure we're not sending any invalid properties
    delete (apiTask as any).assignee;
    delete (apiTask as any).project;
    
    const result = await fetchApi<TaskApiResponse>('/tasks', {
      method: 'POST',
      body: JSON.stringify(apiTask),
    });
    
    // Refresh analytics after creating a task
    refreshAnalytics();
    
    return result;
  },
    
  update: async (id: string, taskData: Partial<Task>) => {
    const result = await fetchApi<TaskApiResponse>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(taskData),
    });
    
    // Refresh analytics after updating a task
    refreshAnalytics();
    
    return result;
  },
    
  delete: async (id: string) => {
    const result = await fetchApi<{ message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
    
    // Refresh analytics after deleting a task
    refreshAnalytics();
    
    return result;
  },
    
  updateStatus: async (id: string, status: Task['status']) => {
    const result = await fetchApi<TaskApiResponse>(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    
    // Refresh analytics after updating task status
    refreshAnalytics();
    
    return result;
  },
    
  getByPriority: (priority: string) =>
    fetchApi<TaskApiResponse[]>(`/tasks?priority=${priority}`),
    
  search: (query: string) =>
    fetchApi<TaskApiResponse[]>(`/tasks/search?q=${encodeURIComponent(query)}`),
    
  markAsComplete: (id: string) =>
    fetchApi<TaskApiResponse>(`/tasks/${id}/complete`, {
      method: 'PATCH',
    }),
}; 