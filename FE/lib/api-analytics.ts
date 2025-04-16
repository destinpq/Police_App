/**
 * Analytics API service
 */

import { fetchApi } from './api-core';

// Analytics parameters interface
export interface AnalyticsParams {
  userId?: string;
  departmentId?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
}

// Helper to build query params
function buildQueryParams(params?: AnalyticsParams): string {
  if (!params) return '';
  
  const queryParams = new URLSearchParams();
  if (params.userId) queryParams.append('userId', params.userId);
  if (params.departmentId) queryParams.append('departmentId', params.departmentId);
  if (params.projectId) queryParams.append('projectId', params.projectId);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  
  return queryParams.toString() ? `?${queryParams.toString()}` : '';
}

/**
 * Analytics related API calls
 */
export const analyticsApi = {
  getDashboard: (params?: AnalyticsParams) => {
    const query = buildQueryParams(params);
    return fetchApi<any>(`/analytics/dashboard${query}`);
  },
    
  getTaskCompletion: (params?: AnalyticsParams) => {
    const query = buildQueryParams(params);
    return fetchApi<any>(`/analytics/task-completion${query}`);
  },
    
  getTimeMetrics: (params?: AnalyticsParams) => {
    const query = buildQueryParams(params);
    return fetchApi<any>(`/analytics/time-metrics${query}`);
  },
    
  getCategoryDistribution: (params?: AnalyticsParams) => {
    const query = buildQueryParams(params);
    return fetchApi<any>(`/analytics/category-distribution${query}`);
  },
    
  getWeeklyActivity: (params?: AnalyticsParams) => {
    const query = buildQueryParams(params);
    return fetchApi<any>(`/analytics/weekly-activity${query}`);
  },
    
  getEfficiency: (params?: AnalyticsParams) => {
    const query = buildQueryParams(params);
    return fetchApi<any>(`/analytics/efficiency${query}`);
  },
    
  getOverdue: (params?: AnalyticsParams) => {
    const query = buildQueryParams(params);
    return fetchApi<any>(`/analytics/overdue${query}`);
  },

  getTeamPerformance: (params?: AnalyticsParams) => {
    const query = buildQueryParams(params);
    return fetchApi<any[]>(`/analytics/team-performance${query}`);
  },
  
  getMonthlyTrends: (params?: AnalyticsParams) => {
    const query = buildQueryParams(params);
    return fetchApi<any[]>(`/analytics/monthly-trends${query}`);
  },
  
  getUserPerformance: (params?: AnalyticsParams) => {
    const query = buildQueryParams(params);
    return fetchApi<any>(`/analytics/user-performance${query}`);
  },
  
  getProjectProgress: (params?: AnalyticsParams) => {
    const query = buildQueryParams(params);
    return fetchApi<any>(`/analytics/project-progress${query}`);
  },
}; 