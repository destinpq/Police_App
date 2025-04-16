/**
 * API services index file
 * Exports all API modules for convenient imports
 */

// Core API functionality
import { fetchApi, API_BASE_URL, setMockDataMode, isMockDataMode } from './api-core';
export { fetchApi, API_BASE_URL, setMockDataMode, isMockDataMode } from './api-core';

// Authentication API
export { authApi } from './api-auth';
export type { UserData } from './api-auth';

// Resource APIs
export { usersApi, teamMembersApi } from './api-users';
export type { UserApiResponse } from './types';

export { tasksApi } from './api-tasks';
export type { Task, TaskApiResponse } from './types';

export { projectsApi } from './api-projects';
export type { Project, ProjectApiResponse } from './types';
export type { ProjectStats } from './api-projects';

export { departmentsApi, rolesApi } from './api-organization';
export type { DepartmentApiResponse, RoleApiResponse } from './api-organization';

export { analyticsApi } from './api-analytics';
export type { AnalyticsParams } from './api-analytics';

// Function to check API connection and use mock data if needed
export async function checkApiConnection(forceCheck = false): Promise<boolean> {
  try {
    // Attempt to connect to the health endpoint
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      credentials: 'include',
      // Short timeout to avoid hanging UI
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      throw new Error(`Health check failed with status: ${response.status}`);
    }
    
    // Parse the health check response
    const healthData = await response.json();
    
    // Check if database is connected
    const isDBConnected = healthData.database?.status === 'connected';
    const apiStatus = healthData.status === 'ok';
    
    if (!isDBConnected) {
      console.warn('API is available but database connection is not working', 
                   healthData.database?.error);
    }
    
    const isConnected = apiStatus && isDBConnected;
    
    // If connected, make sure we're using the real API
    if (isConnected) {
      setMockDataMode(false);
      return true;
    } else {
      console.warn('API health check returned degraded status, switching to mock data');
      setMockDataMode(true);
      
      // Initialize mock data
      try {
        const { initMockData } = await import('./api-mock-data');
        initMockData();
        console.log('Successfully initialized mock data');
      } catch (mockError) {
        console.error('Failed to initialize mock data:', mockError);
      }
      
      return false;
    }
  } catch (error) {
    console.warn('API connection failed:', error);
    // Enable mock data mode if API is unavailable
    setMockDataMode(true);
    
    // Import and initialize mock data
    try {
      // Dynamically import the mock data module
      const { initMockData } = await import('./api-mock-data');
      initMockData();
      console.log('Successfully initialized mock data');
    } catch (mockError) {
      console.error('Failed to initialize mock data:', mockError);
    }
    
    return false;
  }
}

// Import the API objects for the ApiType
import { usersApi } from './api-users';
import { authApi } from './api-auth';
import { tasksApi } from './api-tasks';
import { projectsApi } from './api-projects';
import { teamMembersApi } from './api-users';
import { analyticsApi } from './api-analytics';
import { departmentsApi, rolesApi } from './api-organization';

/**
 * API type for better TypeScript support
 */
export interface ApiType {
  users: typeof usersApi;
  auth: typeof authApi;
  tasks: typeof tasksApi;
  projects: typeof projectsApi;
  teamMembers: typeof teamMembersApi;
  analytics: typeof analyticsApi;
  departments: typeof departmentsApi;
  roles: typeof rolesApi;
}

/**
 * Default export with all API utilities
 */
const api: ApiType = {
  users: usersApi,
  auth: authApi,
  tasks: tasksApi,
  projects: projectsApi,
  teamMembers: teamMembersApi,
  analytics: analyticsApi,
  departments: departmentsApi,
  roles: rolesApi,
};

export default api;

/**
 * Manually toggle mock data mode (useful for testing)
 */
export function toggleMockDataMode(useMock?: boolean): boolean {
  const newMode = useMock !== undefined ? useMock : !isMockDataMode();
  setMockDataMode(newMode);
  
  // Initialize mock data if needed
  if (newMode) {
    try {
      // Using dynamic import to avoid circular dependencies
      import('./api-mock-data').then(module => {
        module.initMockData();
        console.log('Mock data initialized successfully');
      }).catch(error => {
        console.error('Failed to initialize mock data:', error);
      });
    } catch (error) {
      console.error('Error importing mock data module:', error);
    }
  }
  
  return newMode;
} 