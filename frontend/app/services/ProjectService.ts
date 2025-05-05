import { Project, CreateProjectDto, UpdateProjectDto } from '../types/project';
import { Task } from '../types/task';
import { getAuthHeaders } from './AuthService';

const API_URL = 'http://localhost:3001/projects';

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
    
    // Clean up the project data to ensure proper timeline handling
    const projectData = { ...project };
    
    // If we're specifically removing a timeline, make sure the backend knows
    if (projectData.startDate === undefined && projectData.endDate === undefined) {
      // Set to null to clear values in the backend
      projectData.startDate = null;
      projectData.endDate = null;
    }
    
    const response = await fetch(`${API_URL}/${id}`, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(projectData),
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
    const options = getAuthHeaders();
    const response = await fetch(`http://localhost:3001/tasks/project/${projectId}`, options);
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks for project with id ${projectId}`);
    }
    return response.json();
  },
}; 