/**
 * API utilities for making requests to the backend
 */

// Define API base URL with environment variable and hard fallback
// The fallback URL is used if the environment variable is not available
export const API_BASE_URL = 
  typeof window !== 'undefined' && window.ENV_API_URL 
    ? window.ENV_API_URL 
    : (process.env.NEXT_PUBLIC_API_URL || 'https://octopus-app-ct5vs.ondigitalocean.app/api');

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
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    return await response.json();
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