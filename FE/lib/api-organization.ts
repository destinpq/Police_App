/**
 * Organization API service (departments and roles)
 */

import { fetchApi } from './api-core';

// Department interface
export interface DepartmentApiResponse {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  manager?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Role interface
export interface RoleApiResponse {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Departments related API calls
 */
export const departmentsApi = {
  getAll: () => 
    fetchApi<DepartmentApiResponse[]>('/departments'),
    
  getById: (id: string) => 
    fetchApi<DepartmentApiResponse>(`/departments/${id}`),
    
  create: (data: {
    name: string;
    description?: string;
    managerId?: string;
  }) => 
    fetchApi<DepartmentApiResponse>('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  update: (id: string, data: {
    name?: string;
    description?: string;
    managerId?: string;
  }) => 
    fetchApi<DepartmentApiResponse>(`/departments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    
  delete: (id: string) => 
    fetchApi<{ message: string }>(`/departments/${id}`, {
      method: 'DELETE',
    }),
    
  getMembers: (id: string) =>
    fetchApi<any[]>(`/departments/${id}/members`),
};

/**
 * Roles related API calls
 */
export const rolesApi = {
  getAll: () => 
    fetchApi<RoleApiResponse[]>('/roles'),
    
  getById: (id: string) => 
    fetchApi<RoleApiResponse>(`/roles/${id}`),
    
  create: (data: {
    name: string;
    description?: string;
    permissions?: string[];
  }) => 
    fetchApi<RoleApiResponse>('/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  update: (id: string, data: {
    name?: string;
    description?: string;
    permissions?: string[];
  }) => 
    fetchApi<RoleApiResponse>(`/roles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    
  delete: (id: string) => 
    fetchApi<{ message: string }>(`/roles/${id}`, {
      method: 'DELETE',
    }),
    
  getMembers: (id: string) =>
    fetchApi<any[]>(`/roles/${id}/members`),
}; 