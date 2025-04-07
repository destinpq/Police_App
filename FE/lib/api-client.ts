/**
 * Enhanced API Client
 * 
 * A typed, robust API client for handling API requests with consistent
 * error handling, response formatting, and authorization.
 */

// Standard API response format
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  status: 'success' | 'error';
}

// Configuration options for API requests
interface ApiClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  timeout?: number;
}

// Options for individual requests
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...(config.headers || {})
    };
    this.timeout = config.timeout || 10000; // Default 10s timeout
  }

  /**
   * Set authorization token for requests
   */
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clear authorization token
   */
  clearAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Execute API request with automatic error handling
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('/') 
      ? `${this.baseUrl}${endpoint}`
      : `${this.baseUrl}/${endpoint}`;
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    // Merge options with defaults
    const fetchOptions: RequestInit = {
      method: options.method || 'GET',
      headers: {
        ...this.defaultHeaders,
        ...(options.headers || {})
      },
      signal: options.signal || controller.signal
    };
    
    // Add body if provided
    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }
    
    try {
      const response = await fetch(url, fetchOptions);
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      // Parse response
      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      // Check for error responses
      if (!response.ok) {
        return {
          error: {
            message: data.message || 'An error occurred',
            code: data.code || response.status.toString(),
            details: data.details || data
          },
          status: 'error'
        };
      }
      
      // Return successful response
      return {
        data: data as T,
        status: 'success'
      };
    } catch (error) {
      // Clear timeout
      clearTimeout(timeoutId);
      
      // Handle fetch errors (network issues, timeouts, etc)
      return {
        error: {
          message: error instanceof Error 
            ? error.message 
            : 'Network request failed',
          code: 'network_error',
          details: error
        },
        status: 'error'
      };
    }
  }
  
  // Convenience methods for common HTTP methods
  async get<T>(endpoint: string, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }
  
  async post<T>(endpoint: string, data: any, options: Omit<RequestOptions, 'method'> = {}) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body: data });
  }
  
  async put<T>(endpoint: string, data: any, options: Omit<RequestOptions, 'method'> = {}) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body: data });
  }
  
  async patch<T>(endpoint: string, data: any, options: Omit<RequestOptions, 'method'> = {}) {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body: data });
  }
  
  async delete<T>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Create default API client instance
export const apiClient = new ApiClient({
  baseUrl: '/api', // Adjust as needed
  timeout: 15000 // 15 second timeout
});

export default apiClient; 