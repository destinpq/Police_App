import { User } from '../types/user';
import { getAuthHeaders } from './AuthService';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/users`;

export const UserService = {
  async getAllUsers(): Promise<User[]> {
    const options = getAuthHeaders();
    const response = await fetch(API_URL, options);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  },

  async getUserById(id: number): Promise<User> {
    const options = getAuthHeaders();
    const response = await fetch(`${API_URL}/${id}`, options);
    if (!response.ok) {
      throw new Error(`Failed to fetch user with id ${id}`);
    }
    return response.json();
  },

  async getAdminUsers(): Promise<User[]> {
    const options = getAuthHeaders();
    const response = await fetch(`${API_URL}/admin/all`, options);
    if (!response.ok) {
      throw new Error('Failed to fetch admin users');
    }
    return response.json();
  }
}; 