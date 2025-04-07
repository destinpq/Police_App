/**
 * API service for connecting to the backend
 */

// Use environment variable for API URL with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/api';

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
    fetchApi<{ message: string; task: any }>(`/tasks/${id}?id=${id}`, {
      method: 'PATCH',
      body: JSON.stringify(taskData),
    }),
    
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/tasks/${id}?id=${id}`, { method: 'DELETE' }),
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
    fetchApi<{ message: string; project: any }>(`/projects/${id}?id=${id}`, {
      method: 'PATCH',
      body: JSON.stringify(projectData),
    }),
    
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/projects/${id}?id=${id}`, { method: 'DELETE' }),
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
 * Team members related API calls
 */
export const teamMembersApi = {
  create: (memberData: {
    name: string;
    email: string;
    role: string;
    department: string;
    bio?: string;
    phone?: string;
    skills?: string;
    avatar?: string;
  }) =>
    fetchApi<any>('/users', {
      method: 'POST',
      body: JSON.stringify({ 
        ...memberData,
        // Add password for user creation, this would be better handled by the backend
        password: 'DefaultPassword123!' 
      }),
    }),
    
  getAll: () => 
    fetchApi<any[]>('/users'),
    
  getById: (id: string) => 
    fetchApi<any>(`/users/${id}`),
    
  update: (id: string, memberData: any) =>
    fetchApi<{ message: string; user: any }>(`/users/${id}?id=${id}`, {
      method: 'PATCH',
      body: JSON.stringify(memberData),
    }),
    
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/users/${id}?id=${id}`, { method: 'DELETE' }),
};

// Add analytics API service
/**
 * Analytics related API calls
 */
export const analyticsApi = {
  getDashboard: (userId?: string) => 
    fetchApi<any>(`/analytics/dashboard${userId ? `?userId=${userId}` : ''}`),
    
  getTaskCompletion: (userId?: string) => 
    fetchApi<any>(`/analytics/task-completion${userId ? `?userId=${userId}` : ''}`),
    
  getTimeMetrics: (userId?: string) => 
    fetchApi<any>(`/analytics/time-metrics${userId ? `?userId=${userId}` : ''}`),
    
  getCategoryDistribution: (userId?: string) => 
    fetchApi<any>(`/analytics/category-distribution${userId ? `?userId=${userId}` : ''}`),
    
  getWeeklyActivity: (userId?: string) => 
    fetchApi<any>(`/analytics/weekly-activity${userId ? `?userId=${userId}` : ''}`),
    
  getEfficiency: (userId?: string) => 
    fetchApi<any>(`/analytics/efficiency${userId ? `?userId=${userId}` : ''}`),
    
  getOverdue: (userId?: string) => 
    fetchApi<any>(`/analytics/overdue${userId ? `?userId=${userId}` : ''}`),
    
  getTeamPerformance: () => 
    fetchApi<any>(`/analytics/team-performance`),
    
  getMonthlyTrends: (userId?: string) => 
    fetchApi<any>(`/analytics/monthly-trends${userId ? `?userId=${userId}` : ''}`),
};

// Add departments API service
export const departmentsApi = {
  create: (departmentData: {
    name: string;
    description?: string;
    manager?: string;
  }) =>
    fetchApi<any>('/departments', {
      method: 'POST',
      body: JSON.stringify(departmentData),
    }),
    
  getAll: () => 
    fetchApi<any[]>('/departments'),
    
  getById: (id: string) => 
    fetchApi<any>(`/departments/${id}`),
    
  update: (id: string, departmentData: any) =>
    fetchApi<{ message: string; department: any }>(`/departments/${id}?id=${id}`, {
      method: 'PATCH',
      body: JSON.stringify(departmentData),
    }),
    
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/departments/${id}?id=${id}`, { method: 'DELETE' }),
};

// Add roles API service
export const rolesApi = {
  create: (roleData: {
    name: string;
    description?: string;
    isAdmin?: boolean;
  }) =>
    fetchApi<any>('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    }),
    
  getAll: () => 
    fetchApi<any[]>('/roles'),
    
  getById: (id: string) => 
    fetchApi<any>(`/roles/${id}`),
    
  update: (id: string, roleData: any) =>
    fetchApi<{ message: string; role: any }>(`/roles/${id}?id=${id}`, {
      method: 'PATCH',
      body: JSON.stringify(roleData),
    }),
    
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/roles/${id}?id=${id}`, { method: 'DELETE' }),
};

/**
 * Default export of all API services
 */
const api = {
  users: usersApi,
  auth: authApi,
  tasks: tasksApi,
  projects: projectsApi,
  departments: departmentsApi,
  roles: rolesApi,
  seed: seedApi,
  teamMembers: teamMembersApi,
  analytics: analyticsApi,
};

export default api; 