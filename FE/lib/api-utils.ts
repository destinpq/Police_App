/**
 * API utilities for making requests to the backend
 */

// Import the API_BASE_URL from api-core.ts to ensure consistency
import { API_BASE_URL as CORE_API_BASE_URL } from './api-core';

// Get the current environment
const isDevelopment = process.env.NODE_ENV === 'development';

// Define API base URL with environment variable fallbacks
export const getApiBaseUrl = (): string => {
  // Browser-side: Use window.ENV_API_URL if available (set by api-config.js)
  if (typeof window !== 'undefined' && window.ENV_API_URL) {
    return window.ENV_API_URL;
  }
  
  // Use the same URL as defined in api-core.ts
  return CORE_API_BASE_URL;
};

// Create and export the API base URL
export const API_BASE_URL = getApiBaseUrl();

// Log the API URL during initialization
if (typeof window !== 'undefined') {
  console.log('API_BASE_URL:', API_BASE_URL);
  // Add the API URL to window for debugging
  window.API_BASE_URL = API_BASE_URL;
}

/**
 * Utility function to create API endpoints
 * @param path - The API path without leading slash
 * @returns Full API URL
 */
export function apiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
}

/**
 * Fetch data from the API with retry mechanism
 */
export async function fetchFromApi<T>(
  path: string,
  options: RequestInit = {},
  retries = 3,
  backoff = 300
): Promise<T> {
  const url = apiUrl(path);
  
  try {
    // First check if navigator is online
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.error('Network is offline');
      throw new Error('Network is offline. Please check your internet connection.');
    }

    // Set a timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // Include credentials for CORS requests with cookies
      credentials: 'include',
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}) from ${url}: ${errorText}`);
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    // Log successful API requests in development
    if (isDevelopment) {
      console.log(`API Success: ${url}`);
    }

    // Handle no-content responses (204) properly
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { success: true } as unknown as T;
    }

    // For other responses, try to parse as JSON
    try {
      return await response.json();
    } catch (e) {
      console.warn(`Response from ${url} is not valid JSON, returning empty object`, e);
      return {} as T;
    }
  } catch (error) {
    // Distinguish between network errors and other errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error(`Network error connecting to ${url}. The server might be down or unreachable.`);
      
      // Implement retry mechanism for network errors
      if (retries > 0) {
        console.log(`Retrying in ${backoff}ms... (${retries} retries left)`);
        
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(fetchFromApi<T>(path, options, retries - 1, backoff * 2));
          }, backoff);
        });
      }
      
      throw new Error(`Failed to connect to the server after multiple attempts. Please check if the server is running.`);
    }
    
    console.error(`Error fetching from ${url}:`, error);
    throw error;
  }
}

/**
 * Dispatches an event to refresh analytics data
 */
export function refreshAnalytics() {
  // Create and dispatch a custom event that analytics components can listen for
  const event = new CustomEvent('analytics:refresh');
  window.dispatchEvent(event);
  console.log('Dispatched analytics:refresh event');
}

// Add TypeScript interface augmentation for window
declare global {
  interface Window {
    ENV_API_URL?: string;
    API_BASE_URL?: string;
  }
} 