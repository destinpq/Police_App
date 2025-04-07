/**
 * API Hooks for React components
 * 
 * Custom React hooks for data fetching using our enhanced API client.
 * These hooks provide loading states, error handling, and data caching.
 */

import { useState, useEffect, useCallback } from 'react';
import { ApiResponse, apiClient } from './api-client';
import { Task, TaskApiResponse, adaptApiToTask } from './task-adapter';

// Hook state for data fetching
interface UseFetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Generic data fetching hook
 */
export function useFetch<T>(endpoint: string): UseFetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const response = await apiClient.get<T>(endpoint);
    
    if (response.status === 'success' && response.data) {
      setData(response.data);
    } else {
      setError(response.error?.message || 'Failed to fetch data');
    }
    
    setIsLoading(false);
  }, [endpoint]);

  // Fetch data when component mounts or endpoint changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

/**
 * Hook for fetching tasks with automatic conversion to Task interface
 */
export function useTasks(filters?: Record<string, any>): UseFetchState<Task[]> {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Build endpoint with query parameters if filters provided
  const getEndpoint = useCallback(() => {
    if (!filters || Object.keys(filters).length === 0) {
      return 'tasks';
    }

    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    return `tasks?${queryParams.toString()}`;
  }, [filters]);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const endpoint = getEndpoint();
    const response = await apiClient.get<TaskApiResponse[]>(endpoint);
    
    if (response.status === 'success' && response.data) {
      // Convert API response to our Task interface
      const standardizedTasks = response.data.map(adaptApiToTask);
      setTasks(standardizedTasks);
    } else {
      setError(response.error?.message || 'Failed to fetch tasks');
    }
    
    setIsLoading(false);
  }, [getEndpoint]);

  // Fetch tasks when component mounts or filters change
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { data: tasks, isLoading, error, refetch: fetchTasks };
}

/**
 * Hook for creating a new task
 */
export function useCreateTask() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createTask = async (taskData: any): Promise<Task | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const response = await apiClient.post<TaskApiResponse>('tasks', taskData);
    
    if (response.status === 'success' && response.data) {
      setSuccess(true);
      setIsLoading(false);
      return adaptApiToTask(response.data);
    } else {
      setError(response.error?.message || 'Failed to create task');
      setIsLoading(false);
      return null;
    }
  };

  return { createTask, isLoading, error, success };
}

/**
 * Hook for updating a task
 */
export function useUpdateTask(taskId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateTask = async (taskData: any): Promise<Task | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const response = await apiClient.patch<TaskApiResponse>(`tasks/${taskId}`, taskData);
    
    if (response.status === 'success' && response.data) {
      setSuccess(true);
      setIsLoading(false);
      return adaptApiToTask(response.data);
    } else {
      setError(response.error?.message || 'Failed to update task');
      setIsLoading(false);
      return null;
    }
  };

  return { updateTask, isLoading, error, success };
}

/**
 * Hook for deleting a task
 */
export function useDeleteTask() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const deleteTask = async (taskId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const response = await apiClient.delete(`tasks/${taskId}`);
    
    if (response.status === 'success') {
      setSuccess(true);
      setIsLoading(false);
      return true;
    } else {
      setError(response.error?.message || 'Failed to delete task');
      setIsLoading(false);
      return false;
    }
  };

  return { deleteTask, isLoading, error, success };
} 