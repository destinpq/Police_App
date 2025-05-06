import { Task, CreateTaskDto, UpdateTaskDto } from '../types/task';
import { getAuthHeaders } from './AuthService';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/tasks`;

export const TaskService = {
  async getAllTasks(): Promise<Task[]> {
    const options = getAuthHeaders();
    const response = await fetch(API_URL, options);
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    return response.json();
  },

  async getTaskById(id: number): Promise<Task> {
    const options = getAuthHeaders();
    const response = await fetch(`${API_URL}/${id}`, options);
    if (!response.ok) {
      throw new Error(`Failed to fetch task with id ${id}`);
    }
    return response.json();
  },

  async createTask(task: CreateTaskDto): Promise<Task> {
    const options = getAuthHeaders();
    const response = await fetch(API_URL, {
      ...options,
      method: 'POST',
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error('Failed to create task');
    }
    return response.json();
  },

  async updateTask(id: number, task: UpdateTaskDto): Promise<Task> {
    const options = getAuthHeaders();
    const response = await fetch(`${API_URL}/${id}`, {
      ...options,
      method: 'PUT', 
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error(`Failed to update task with id ${id}`);
    }
    return response.json();
  },

  async deleteTask(id: number): Promise<void> {
    const options = getAuthHeaders();
    const response = await fetch(`${API_URL}/${id}`, {
      ...options,
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete task with id ${id}`);
    }
  },
  
  async getTasksByProject(projectId: number): Promise<Task[]> {
    const options = getAuthHeaders();
    const response = await fetch(`${API_URL}/project/${projectId}`, options);
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks for project with id ${projectId}`);
    }
    return response.json();
  },
}; 