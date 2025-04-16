/**
 * Task adapter functions
 * This file handles converting between API task responses and our application's Task type
 */

import { 
  formatDate, 
  formatShortDate, 
  getDueDateStatus,
  toISOString 
} from './date-utils';
import { Task, TaskApiResponse, TaskFormData, User, Project } from './types';

/**
 * Converts API response to the application Task format.
 */
export function adaptApiToTask(apiTask: TaskApiResponse): Task {
  // Handle date conversion
  let dueDate: string | undefined = undefined;
  if (apiTask.dueDate) {
    dueDate = typeof apiTask.dueDate === 'string' 
      ? apiTask.dueDate 
      : String(apiTask.dueDate);
  }

  // Handle tags conversion
  let tags: string | undefined = undefined;
  if (apiTask.tags) {
    tags = Array.isArray(apiTask.tags) 
      ? apiTask.tags.join(', ') 
      : apiTask.tags;
  }

  // Handle estimatedHours conversion (can be number or string)
  let estimatedHours: string | undefined = undefined;
  if (apiTask.estimatedHours != null) {
    estimatedHours = typeof apiTask.estimatedHours === 'number'
      ? String(apiTask.estimatedHours)
      : String(apiTask.estimatedHours);
  }

  // Handle assignee conversion
  let assignee: User | undefined = undefined;
  if (apiTask.assignee) {
    assignee = {
      id: apiTask.assignee.id,
      name: apiTask.assignee.name,
      email: apiTask.assignee.email || '',
      avatar: apiTask.assignee.avatar || undefined,
      role: apiTask.assignee.role || undefined
    };
  }

  // Handle project conversion
  let project: Project | undefined = undefined;
  if (apiTask.project) {
    project = {
      id: apiTask.project.id,
      name: apiTask.project.name,
      description: apiTask.project.description || '',  
      status: (apiTask.project.status as Project['status']) || 'active',
      priority: (apiTask.project.priority as Project['priority']) || 'medium',
      startDate: apiTask.project.startDate || undefined,
      endDate: apiTask.project.endDate || undefined
    };
  }

  return {
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description,
    status: apiTask.status as Task['status'],
    priority: apiTask.priority as Task['priority'],
    assignee,
    assigneeId: apiTask.assigneeId || undefined,
    project,
    projectId: apiTask.projectId || undefined,
    dueDate,
    tags,
    estimatedHours,
    createdAt: apiTask.createdAt,
    updatedAt: apiTask.updatedAt
  };
}

/**
 * Converts form data (TaskFormData) to the application Task format.
 */
export function adaptFormToTask(formData: TaskFormData): Partial<TaskApiResponse> {
  // Define UUID validation pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  // Create a clean task API-ready object
  const cleanTask: Partial<TaskApiResponse> = {
    title: formData.title,
    description: formData.description,
    status: formData.status,
    priority: formData.priority,
    dueDate: formData.dueDate ? formData.dueDate.toISOString().split('T')[0] : undefined,
    tags: formData.tags,
    estimatedHours: formData.estimatedHours,
  };
  
  // Only add assigneeId if it's a valid UUID
  if (formData.assignee && uuidPattern.test(formData.assignee)) {
    cleanTask.assigneeId = formData.assignee;
  }
  
  // Only add projectId if it's a valid UUID
  if (formData.project && uuidPattern.test(formData.project)) {
    cleanTask.projectId = formData.project;
  }
  
  return cleanTask;
}

/**
 * Formats a task for display, handling all necessary transformations
 */
export function formatTaskForDisplay(task: Task) {
  return {
    ...task,
    statusDisplay: task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' '),
    priorityDisplay: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
    assigneeName: task.assignee?.name || getAssigneeName(task.assigneeId, []),
    formattedDueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'
  };
}

/**
 * Helper function to get an assignee's name from their ID using the team members list.
 */
export function getAssigneeName(assigneeId: string | null | undefined, teamMembers: User[] = []): string {
  if (!assigneeId) return 'Unassigned';
  
  const member = teamMembers.find(m => m.id === assigneeId);
  return member?.name || 'Unknown';
}

/**
 * Prepare task data for API submission
 */
export function prepareTaskForApi(task: Task): Partial<TaskApiResponse> {
  // Convert Task back to the structure expected by API (e.g., for updates)
  return {
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate,
    assigneeId: task.assigneeId,
    projectId: task.projectId,
    tags: task.tags,
    estimatedHours: task.estimatedHours,
    // Exclude fields not sent in updates usually (id, createdAt, updatedAt, assignee, project)
  };
} 