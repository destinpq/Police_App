"use client"

import { useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import api, { tasksApi, projectsApi, usersApi } from "@/lib/api"

/**
 * This component sets up global error handling for API calls
 * It attaches a global error event listener for API errors
 */
export function ApiErrorInterceptor() {
  const { handleAuthError } = useAuth()

  useEffect(() => {
    // Create a custom event listener for API auth errors
    const handleApiAuthError = (event: CustomEvent) => {
      console.log("Auth error intercepted:", event.detail);
      handleAuthError(event.detail);
    }

    // Add the event listener with type assertion
    window.addEventListener('api-auth-error' as any, handleApiAuthError as EventListener)

    return () => {
      // Remove listener on cleanup
      window.removeEventListener('api-auth-error' as any, handleApiAuthError as EventListener)
    }
  }, [handleAuthError])

  // This is a utility component that doesn't render anything
  return null
}

// Helper function to dispatch auth error events
export function dispatchAuthError(error: any) {
  if (typeof window !== 'undefined') {
    console.log("Auth error detected:", error);
    const event = new CustomEvent('api-auth-error', { detail: error });
    window.dispatchEvent(event);
  }
} 