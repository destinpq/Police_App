/**
 * Mock data for offline or development use
 * This module provides mock data when the backend server is unavailable
 */

// Flag to track if mock data is already initialized
let isMockDataInitialized = false;

// Cache for mock data to avoid recreating it
interface MockDataCache {
  users: any[];
  tasks: any[];
  projects: any[];
  departments: any[];
  roles: any[];
  teamMembers: any[];
  analytics: any[];
  [key: string]: any[];
}

const mockDataCache: MockDataCache = {
  users: [],
  tasks: [],
  projects: [],
  departments: [],
  roles: [],
  teamMembers: [],
  analytics: []
};

// Initialize mock data if not already done
export function initMockData(): MockDataCache {
  if (isMockDataInitialized) {
    return mockDataCache;
  }

  console.log('Initializing mock data...');
  
  // Create mock users
  mockDataCache.users = [
    { id: 'user-1', name: 'John Doe', email: 'john@example.com', avatar: null },
    { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', avatar: null },
    { id: 'user-3', name: 'Bob Johnson', email: 'bob@example.com', avatar: null }
  ];
  
  // Create mock team members (same as users but with additional fields)
  mockDataCache.teamMembers = mockDataCache.users.map(user => ({
    ...user,
    role: { id: 'role-1', name: 'Developer' },
    department: { id: 'dept-1', name: 'Engineering' },
    bio: `Bio for ${user.name}`,
    skills: ['JavaScript', 'React', 'TypeScript']
  }));
  
  // Create mock departments
  mockDataCache.departments = [
    { id: 'dept-1', name: 'Engineering' },
    { id: 'dept-2', name: 'Marketing' },
    { id: 'dept-3', name: 'HR' }
  ];
  
  // Create mock roles
  mockDataCache.roles = [
    { id: 'role-1', name: 'Developer' },
    { id: 'role-2', name: 'Designer' },
    { id: 'role-3', name: 'Manager' }
  ];
  
  // Create mock projects
  mockDataCache.projects = [
    { 
      id: 'project-1', 
      name: 'Website Redesign', 
      description: 'Redesign of the company website', 
      status: 'in-progress',
      priority: 'high',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      manager: mockDataCache.users[0],
      department: mockDataCache.departments[0]
    },
    { 
      id: 'project-2', 
      name: 'Mobile App', 
      description: 'Development of the mobile app', 
      status: 'not-started',
      priority: 'medium',
      startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      manager: mockDataCache.users[1],
      department: mockDataCache.departments[0]
    }
  ];
  
  // Create mock tasks
  mockDataCache.tasks = [
    {
      id: 'task-1',
      title: 'Design Homepage',
      description: 'Create a new design for the homepage',
      status: 'todo',
      priority: 'high',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignee: mockDataCache.users[1],
      assigneeId: mockDataCache.users[1].id,
      project: mockDataCache.projects[0],
      projectId: mockDataCache.projects[0].id,
      tags: ['design', 'frontend']
    },
    {
      id: 'task-2',
      title: 'Implement Authentication',
      description: 'Add user authentication to the application',
      status: 'in-progress',
      priority: 'high',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignee: mockDataCache.users[0],
      assigneeId: mockDataCache.users[0].id,
      project: mockDataCache.projects[0],
      projectId: mockDataCache.projects[0].id,
      tags: ['backend', 'security']
    },
    {
      id: 'task-3',
      title: 'Create API Documentation',
      description: 'Document all API endpoints',
      status: 'done',
      priority: 'medium',
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignee: mockDataCache.users[2],
      assigneeId: mockDataCache.users[2].id,
      project: mockDataCache.projects[0],
      projectId: mockDataCache.projects[0].id,
      tags: ['documentation', 'api']
    }
  ];
  
  // Create mock analytics data
  mockDataCache.analytics = [];
  
  // Create monthly trends data for the past 6 months
  const today = new Date();
  const monthlyTrends = [];
  
  for (let i = 5; i >= 0; i--) {
    const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthName = month.toLocaleString('default', { month: 'long' });
    const year = month.getFullYear();
    
    monthlyTrends.push({
      month: `${monthName} ${year}`,
      completed: Math.floor(Math.random() * 15) + 5,
      created: Math.floor(Math.random() * 20) + 10
    });
  }
  
  // Add monthly trends to analytics collection
  mockDataCache.analytics.push({
    id: 'monthly-trends',
    data: monthlyTrends
  });
  
  // Add team performance data
  mockDataCache.analytics.push({
    id: 'team-performance',
    data: mockDataCache.teamMembers.map((member: any) => ({
      userId: member.id,
      name: member.name,
      tasksCompleted: Math.floor(Math.random() * 30) + 5,
      tasksCreated: Math.floor(Math.random() * 20) + 10,
      efficiency: Math.round((Math.random() * 40) + 60)
    }))
  });
  
  // Add task completion data
  mockDataCache.analytics.push({
    id: 'task-completion',
    data: {
      total: 45,
      completed: 28,
      inProgress: 12,
      notStarted: 5,
      completionRate: 62.2
    }
  });
  
  // Add weekly activity data
  const weeklyActivity = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    weeklyActivity.push({
      day,
      tasks: Math.floor(Math.random() * 8) + 1
    });
  }
  
  mockDataCache.analytics.push({
    id: 'weekly-activity',
    data: weeklyActivity
  });
  
  // Add dashboard summary data
  mockDataCache.analytics.push({
    id: 'dashboard',
    data: {
      tasksTotal: mockDataCache.tasks.length,
      tasksCompleted: mockDataCache.tasks.filter((t: any) => t.status === 'done').length,
      tasksInProgress: mockDataCache.tasks.filter((t: any) => t.status === 'in-progress').length,
      projectsTotal: mockDataCache.projects.length,
      projectsActive: mockDataCache.projects.filter((p: any) => p.status === 'in-progress').length,
      teamMembers: mockDataCache.teamMembers.length
    }
  });
  
  isMockDataInitialized = true;
  return mockDataCache;
}

// Function to get mock data
export function getMockData(collectionName: string): any[] {
  if (!isMockDataInitialized) {
    initMockData();
  }
  
  return mockDataCache[collectionName] || [];
}

// Function to add an item to mock data
export function addMockData(collectionName: string, item: any): any {
  if (!isMockDataInitialized) {
    initMockData();
  }
  
  // Generate an ID if not provided
  if (!item.id) {
    item.id = `${collectionName.slice(0, -1)}-${Date.now()}`;
  }
  
  mockDataCache[collectionName].push(item);
  return item;
}

// Function to update an item in mock data
export function updateMockData(collectionName: string, id: string, updates: any): any | null {
  if (!isMockDataInitialized) {
    initMockData();
  }
  
  const collection = mockDataCache[collectionName];
  const index = collection.findIndex(item => item.id === id);
  
  if (index === -1) {
    return null;
  }
  
  collection[index] = { ...collection[index], ...updates };
  return collection[index];
}

// Function to delete an item from mock data
export function deleteMockData(collectionName: string, id: string): boolean {
  if (!isMockDataInitialized) {
    initMockData();
  }
  
  const collection = mockDataCache[collectionName];
  const initialLength = collection.length;
  
  mockDataCache[collectionName] = collection.filter(item => item.id !== id);
  
  return mockDataCache[collectionName].length < initialLength;
} 