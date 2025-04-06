/**
 * API service for connecting to the backend
 */

// Use environment variable for API URL with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Generic fetch function with error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies for auth
  });

  if (!response.ok) {
    // Handle error responses
    let errorMessage = `API error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  // For 204 No Content responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * User related API calls
 */
export const usersApi = {
  register: (userData: { name: string; email: string; password: string }) =>
    fetchApi<{ id: string; name: string; email: string }>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    
  getAll: () => 
    fetchApi<Array<{ id: string; name: string; email: string }>>('/users'),
    
  getById: (id: string) => 
    fetchApi<{ id: string; name: string; email: string }>(`/users/${id}`),
    
  update: (id: string, userData: { name?: string; password?: string }) =>
    fetchApi<{ id: string; name: string; email: string }>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    }),
    
  delete: (id: string) =>
    fetchApi<void>(`/users/${id}`, { method: 'DELETE' }),
};

/**
 * Authentication related API calls
 */
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    fetchApi<{ access_token: string; user: { id: string; name: string; email: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    
  logout: () => 
    fetchApi<void>('/auth/logout', { method: 'POST' }),
    
  getProfile: () => 
    fetchApi<{ id: string; name: string; email: string }>('/auth/profile'),
};

/**
 * Tasks related API calls
 */
export const tasksApi = {
  create: (taskData: {
    title: string;
    description: string;
    priority: string;
    status: string;
    dueDate?: Date;
    assignee?: string;
    project?: string;
    tags?: string;
    estimatedHours?: string;
  }) =>
    fetchApi<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),
    
  getAll: () => 
    fetchApi<any[]>('/tasks'),
    
  getById: (id: string) => 
    fetchApi<any>(`/tasks/${id}`),
    
  update: (id: string, taskData: any) =>
    fetchApi<any>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(taskData),
    }),
    
  delete: (id: string) =>
    fetchApi<void>(`/tasks/${id}`, { method: 'DELETE' }),
};

/**
 * Projects related API calls
 */
export const projectsApi = {
  create: (projectData: {
    name: string;
    description: string;
    startDate: Date;
    endDate?: Date;
    status: string;
    priority: string;
    manager: string;
    department?: string;
    budget?: string;
    tags?: string;
  }) =>
    fetchApi<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    }),
    
  getAll: () => 
    fetchApi<any[]>('/projects'),
    
  getById: (id: string) => 
    fetchApi<any>(`/projects/${id}`),
    
  update: (id: string, projectData: any) =>
    fetchApi<any>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(projectData),
    }),
    
  delete: (id: string) =>
    fetchApi<void>(`/projects/${id}`, { method: 'DELETE' }),
};

/**
 * Database seeding and reset API calls
 */
export const seedApi = {
  seed: () => 
    fetchApi<{ message: string }>('/seed', { method: 'POST' }),
    
  truncate: () => 
    fetchApi<{ message: string }>('/seed/truncate', { method: 'POST' }),
};

/**
 * Default export of all API services
 */
const api = {
  users: usersApi,
  auth: authApi,
  tasks: tasksApi,
  projects: projectsApi,
  seed: seedApi,
};

export default api; 