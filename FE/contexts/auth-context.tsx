"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

// Import API lazily to prevent circular dependencies
let authApi: any = null;
if (typeof window !== 'undefined') {
  // Only import on client-side
  import('@/lib/api').then(api => {
    authApi = api.default?.auth || api.authApi;
  });
}

// Types
export interface User {
  id: string
  name: string
  email: string
  role?: string
  department?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  handleAuthError: (error: any) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Function to handle authentication errors
  const handleAuthError = (error: any) => {
    console.log("Handling auth error:", error);
    if (error?.status === 401) {
      setUser(null)
      setIsAuthenticated(false)
      
      // Only redirect if not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        router.push('/login')
        toast.error("Session expired. Please log in again.")
      }
    }
  }

  // Function to refresh user data
  const refreshUser = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log("Refreshing user profile...");
      const authAPI = authApi;
      
      // Make sure authApi is loaded
      if (!authAPI) {
        console.log("Auth API not loaded yet, trying to load it");
        try {
          const api = await import('@/lib/api');
          authApi = api.default?.auth || api.authApi;
        } catch (err) {
          console.error("Failed to load auth API:", err);
          setIsLoading(false);
          return;
        }
      }
      
      if (!authAPI) {
        console.error("Auth API still not available after loading attempt");
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      const userData = await authAPI.getProfile();
      
      console.log("User profile data:", userData);
      if (userData && userData.id) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Clear auth state if no user data returned
        console.log("No user data returned from profile endpoint");
        setUser(null);
        setIsAuthenticated(false);
        
        // Don't navigate to login if we're already there
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          // Only show this message if we're not on the login page (to avoid confusion)
          console.log('Not authenticated, staying on current page');
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch user profile:", err);
      
      // Clear authentication state
      setUser(null);
      setIsAuthenticated(false);
      
      // Handle auth errors but don't show toast for routine auth checks
      const isAuthError = err?.status === 401;
      
      if (isAuthError) {
        // Only redirect if we're not already on the login page
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          console.log('Auth check failed, redirecting to login');
          router.push('/login');
        }
      } else if (err?.message) {
        // Only show error toast for non-auth errors
        toast.error(`Profile error: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication status on initial load
  useEffect(() => {
    refreshUser()
  }, [])

  // Function for user login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const authAPI = authApi;
      const response = await authAPI.login({ email, password })
      
      if (response && response.user) {
        setUser(response.user)
        setIsAuthenticated(true)
        toast.success("Login successful")
        return true
      } else {
        throw new Error("Login failed - invalid response")
      }
    } catch (err: any) {
      console.error("Login failed:", err)
      setError(err?.message || "Login failed")
      setUser(null)
      setIsAuthenticated(false)
      toast.error(err?.message || "Login failed")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Function for user logout
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true)
      const authAPI = authApi;
      await authAPI.logout()
      
      setUser(null)
      setIsAuthenticated(false)
      toast.success("Logout successful")
      
      // Redirect to login
      router.push('/login')
    } catch (err: any) {
      console.error("Logout failed:", err)
      // Still clear user data even if API call fails
      setUser(null)
      setIsAuthenticated(false)
      toast.error("Logout failed")
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshUser,
    handleAuthError
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 