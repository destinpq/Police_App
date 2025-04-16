/**
 * Common type definitions for the application
 */

// User type
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

// Project type
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high';
  startDate?: string | Date;
  endDate?: string | Date;
  manager?: string;
  department?: string;
  budget?: string;
  tags?: string;
}

// Base Task interface
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: User;
  assigneeId?: string;
  project?: Project;
  projectId?: string;
  dueDate?: string;
  tags?: string;
  estimatedHours?: string;
  createdAt: string;
  updatedAt: string;
}

// Task form data (from form inputs)
export interface TaskFormData {
  id?: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  assignee?: string;        // This will be the assigneeId (must be UUID)
  dueDate?: Date | null;    // Date object from form
  project?: string;         // This will be the projectId (must be UUID)
  tags?: string;            // Comma-separated string
  estimatedHours?: string;  // String value for hours
}

// API response structure
export interface TaskApiResponse {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee?: {
    id: string;
    name: string;
    email?: string;
    avatar?: string | null;
    role?: string | null;
  } | null;
  assigneeId?: string | null;
  project?: {
    id: string;
    name: string;
    description?: string;
    status?: string;
    priority?: string;
    startDate?: string | null;
    endDate?: string | null;
  } | null;
  projectId?: string | null;
  dueDate?: string | null;
  tags?: string | null;
  estimatedHours?: string | number | null;
  createdAt: string;
  updatedAt: string;
}

// Project API response structure
export interface ProjectApiResponse {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate?: string | null;
  endDate?: string | null;
  manager?: string | null;
  department?: string | null;
  budget?: string | null;
  tags?: string | null;
  createdAt: string;
  updatedAt: string;
}

// User API response structure
export interface UserApiResponse {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role?: string | null;
  createdAt: string;
  updatedAt: string;
} 