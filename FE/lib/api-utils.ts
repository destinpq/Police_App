/**
 * API utilities for making requests to the backend
 */

// Get the current environment
const isDevelopment = process.env.NODE_ENV === 'development';

// Define API base URL with environment variable fallbacks
export const getApiBaseUrl = (): string => {
  // Browser-side: Use window.ENV_API_URL if available (set by api-config.js)
  if (typeof window !== 'undefined' && window.ENV_API_URL) {
    return window.ENV_API_URL;
  }
  
  // Use environment variable if available
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Default to localhost for development
  return 'http://localhost:8888/api';
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
 * Fetch data from the API with error handling
 */
export async function fetchFromApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = apiUrl(path);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

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
    console.error(`Error fetching from ${url}:`, error);
    throw error;
  }
}

// Add TypeScript interface augmentation for window
declare global {
  interface Window {
    ENV_API_URL?: string;
    API_BASE_URL?: string;
  }
} 