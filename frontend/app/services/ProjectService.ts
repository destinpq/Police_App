import { Project, CreateProjectDto, UpdateProjectDto } from '../types/project';
import { Task } from '../types/task';
import { getAuthHeaders } from './AuthService';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/projects`;

export const ProjectService = {
  async getAllProjects(): Promise<Project[]> {
    const options = getAuthHeaders();
    const response = await fetch(API_URL, options);
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    return response.json();
  },

  async getProjectById(id: number): Promise<Project> {
    const options = getAuthHeaders();
    const response = await fetch(`${API_URL}/${id}`, options);
    if (!response.ok) {
      throw new Error(`Failed to fetch project with id ${id}`);
    }
    return response.json();
  },

  async createProject(project: CreateProjectDto): Promise<Project> {
    const options = getAuthHeaders();
    const response = await fetch(API_URL, {
      ...options,
      method: 'POST',
      body: JSON.stringify(project),
    });
    if (!response.ok) {
      throw new Error('Failed to create project');
    }
    return response.json();
  },

  async updateProject(id: number, project: UpdateProjectDto): Promise<Project> {
    const options = getAuthHeaders();
    
    const response = await fetch(`${API_URL}/${id}`, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(project),
    });
    if (!response.ok) {
      throw new Error(`Failed to update project with id ${id}`);
    }
    return response.json();
  },

  async deleteProject(id: number): Promise<void> {
    const options = getAuthHeaders();
    const response = await fetch(`${API_URL}/${id}`, {
      ...options,
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete project with id ${id}`);
    }
  },

  async getTasksByProject(projectId: number): Promise<Task[]> {
    try {
      const options = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/tasks/project/${projectId}`, options)
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks by project');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching tasks by project:', error);
      return [];
    }
  },
}; 