import { Milestone, CreateMilestoneDto, UpdateMilestoneDto } from '../types/milestone';
import { getAuthHeaders } from './AuthService';
import { API_BASE_URL } from '../config';

export class MilestoneService {
  static async getAllMilestones(): Promise<Milestone[]> {
    const options = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/milestones`, options);

    if (!response.ok) {
      throw new Error('Failed to fetch milestones');
    }

    return response.json();
  }

  static async getMilestonesByProject(projectId: number): Promise<Milestone[]> {
    const options = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/milestones/project/${projectId}`, options);

    if (!response.ok) {
      throw new Error(`Failed to fetch milestones for project ${projectId}`);
    }

    return response.json();
  }

  static async getMilestoneById(id: number): Promise<Milestone> {
    const options = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/milestones/${id}`, options);

    if (!response.ok) {
      throw new Error(`Failed to fetch milestone with ID ${id}`);
    }

    return response.json();
  }

  static async createMilestone(milestone: CreateMilestoneDto): Promise<Milestone> {
    const options = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/milestones`, {
      ...options,
      method: 'POST',
      body: JSON.stringify(milestone),
    });

    if (!response.ok) {
      throw new Error('Failed to create milestone');
    }

    return response.json();
  }

  static async updateMilestone(id: number, milestone: UpdateMilestoneDto): Promise<Milestone> {
    const options = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/milestones/${id}`, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(milestone),
    });

    if (!response.ok) {
      throw new Error(`Failed to update milestone with ID ${id}`);
    }

    return response.json();
  }

  static async deleteMilestone(id: number): Promise<void> {
    const options = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/milestones/${id}`, {
      ...options,
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete milestone with ID ${id}`);
    }
  }

  static async updateMilestoneStatus(id: number): Promise<Milestone> {
    const options = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/milestones/${id}/update-status`, {
      ...options,
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error(`Failed to update status for milestone with ID ${id}`);
    }

    return response.json();
  }
} 