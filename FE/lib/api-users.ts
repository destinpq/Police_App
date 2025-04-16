/**
 * Users API service
 */

import { fetchApi } from './api-core';

// User API response interface
export interface UserApiResponse {
  id: string;
  name: string;
  email: string;
  role: { id: string; name: string; description?: string } | null;
  department: { id: string; name: string; description?: string } | null;
  roleId: string | null;
  departmentId: string | null;
  avatar?: string | null;
  bio?: string | null;
  phone?: string | null;
  skills?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Users related API calls
 */
export const usersApi = {
  register: (userData: { name: string; email: string; password: string }) =>
    fetchApi<{ id: string; name: string; email: string }>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    
  create: (memberData: {
    name: string;
    email: string;
    password?: string;
    roleId?: string | null;
    departmentId?: string | null;
    bio?: string | null;
    phone?: string | null;
    skills?: string | null;
    avatar?: string | null;
  }) =>
    fetchApi<UserApiResponse>('/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        ...memberData,
        // Generate a temporary password if not provided
        password: memberData.password || `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
      }),
    }),
    
  getAll: () => 
    fetchApi<UserApiResponse[]>('/users'),
    
  getById: (id: string) => 
    fetchApi<UserApiResponse>(`/users/${id}`),
    
  update: (id: string, userData: any) =>
    fetchApi<{ message: string; user: UserApiResponse }>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    }),
    
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/users/${id}`, { method: 'DELETE' }),
    
  search: (query: string) =>
    fetchApi<UserApiResponse[]>(`/users/search?q=${encodeURIComponent(query)}`),
};

/**
 * Team members related API calls (alias for users with specific UI context)
 */
export const teamMembersApi = {
  create: (memberData: {
    name: string;
    email: string;
    password?: string;
    roleId?: string | null;
    departmentId?: string | null;
    bio?: string | null;
    phone?: string | null;
    skills?: string | null;
    avatar?: string | null;
  }) =>
    fetchApi<UserApiResponse>('/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        ...memberData,
        // Generate a temporary password if not provided
        password: memberData.password || `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
      }),
    }),
    
  getAll: () => 
    fetchApi<UserApiResponse[]>('/users'),
    
  getById: (id: string) => 
    fetchApi<UserApiResponse>(`/users/${id}`),
    
  update: (id: string, memberData: any) =>
    fetchApi<{ message: string; user: UserApiResponse }>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(memberData),
    }),
    
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/users/${id}`, { method: 'DELETE' }),
    
  getByRole: (roleId: string) =>
    fetchApi<UserApiResponse[]>(`/users?roleId=${roleId}`),
    
  getByDepartment: (departmentId: string) =>
    fetchApi<UserApiResponse[]>(`/users?departmentId=${departmentId}`),
}; 