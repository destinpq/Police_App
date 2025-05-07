import { LoginRequest, LoginResponse, User } from '../types/user';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/login`;

// Helper function to get auth headers with token
export const getAuthHeaders = () => {
  const user = AuthService.getCurrentUser();
  const email = user?.email;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (email) {
    headers['Authorization'] = `Bearer ${email}`;
  }
  
  const requestOptions = {
    headers,
    credentials: 'include' as RequestCredentials
  };
  
  return requestOptions;
};

export const AuthService = {
  async login(credentials: LoginRequest): Promise<User> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data: LoginResponse = await response.json();
      
      // Save user to localStorage for client-side session
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout(): void {
    localStorage.removeItem('user');
    window.location.href = '/';
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  },
}; 