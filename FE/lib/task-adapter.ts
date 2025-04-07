/**
 * Task type definitions and adapter functions
 * This file handles converting between API task responses and our application's Task type
 */

import { 
  formatDate, 
  formatShortDate, 
  getDueDateStatus,
  toISOString 
} from './date-utils';

// Task type used in the application UI
export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  assignee?: string;
  dueDate?: string;
  project?: string;
  tags?: string[] | string;
}

// Task values from form inputs
export interface TaskFormValues {
  id?: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  assignee?: string;
  dueDate?: Date;
  project?: string;
  tags?: string | string[];
  estimatedHours?: string;
}

// Task from API responses
export interface TaskApiResponse {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee?: string;
  dueDate?: string;
  project?: string;
  tags?: string[] | string;
  estimatedHours?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Converts a task from the API format to our application format
 */
export function adaptApiToTask(apiTask: TaskApiResponse): Task {
  return {
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description,
    status: apiTask.status as "todo" | "in-progress" | "done",
    priority: apiTask.priority as "low" | "medium" | "high",
    assignee: apiTask.assignee,
    dueDate: apiTask.dueDate,
    project: apiTask.project,
    tags: apiTask.tags,
  };
}

/**
 * Converts form data to a Task
 */
export function adaptFormToTask(formData: TaskFormValues): Task {
  return {
    id: formData.id || `task-${Date.now()}`,
    title: formData.title,
    description: formData.description,
    status: formData.status,
    priority: formData.priority,
    assignee: formData.assignee,
    dueDate: formData.dueDate 
      ? new Date(formData.dueDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : undefined,
    project: formData.project,
    tags: typeof formData.tags === 'string' 
      ? formData.tags.split(',').map(tag => tag.trim())
      : formData.tags,
  };
}

/**
 * Formats a task for display in the UI
 */
export function formatTaskForDisplay(task: Task) {
  return {
    ...task,
    statusDisplay: task.status === "todo" 
      ? "To Do" 
      : task.status === "in-progress" 
        ? "In Progress" 
        : "Done",
    priorityDisplay: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
    formattedDueDate: task.dueDate || '',
  };
}

/**
 * Prepares a Task for API submission
 */
export function prepareTaskForApi(task: Task): any {
  return {
    ...task,
    // Add any transformations needed for API
  };
} 