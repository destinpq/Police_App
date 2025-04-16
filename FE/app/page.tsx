"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import api, { checkApiConnection } from "@/lib/api"
import { API_BASE_URL } from "@/lib/api-core"
import { toast } from "sonner"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertCircle, WifiOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { refreshAnalytics } from "@/lib/api-utils"
import { OverviewSection } from "@/components/dashboard/overview-section"
import { ProjectsSection } from "@/components/dashboard/projects-section"
import { TasksSection } from "@/components/dashboard/tasks-section"
import { adaptApiToTask } from "@/lib/task-adapter"

// Import types from the types module
import type { Task, Project, User, TaskApiResponse, ProjectApiResponse, UserApiResponse } from "@/lib/types"

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [teamMembers, setTeamMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(true)
  const [isRetrying, setIsRetrying] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  // Convert API projects to our application format
  const adaptApiToProject = (apiProject: ProjectApiResponse): Project => {
    return {
      id: apiProject.id,
      name: apiProject.name,
      description: apiProject.description || '',
      status: apiProject.status as Project['status'],
      priority: apiProject.priority as Project['priority'],
      startDate: apiProject.startDate || undefined,
      endDate: apiProject.endDate ? new Date(apiProject.endDate) : undefined,
      manager: typeof apiProject.manager === 'object' && apiProject.manager
        ? apiProject.manager.name 
        : (apiProject.manager || undefined),
      department: typeof apiProject.department === 'object' && apiProject.department !== null
        ? apiProject.department.name
        : (apiProject.department || undefined),
      budget: apiProject.budget || undefined,
      tags: apiProject.tags || undefined
    };
  };

  // Convert API users to our application format
  const adaptApiToUser = (apiUser: UserApiResponse): User => {
    return {
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email || '',
      avatar: apiUser.avatar || undefined,
      role: typeof apiUser.role === 'object' && apiUser.role !== null
        ? apiUser.role.name 
        : (apiUser.role || undefined)
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // First check API connectivity
      const connected = await checkApiConnection()
      setIsConnected(connected)
      
      if (!connected) {
        console.warn("API connectivity issue detected, using fallback data")
        const dbStatus = await checkDatabaseStatus()
        
        if (dbStatus === 'error') {
          toast.warning("Database connection issue detected. Using offline data.")
        } else {
          toast.warning("Server connection issue. Using offline data.")
        }
      }
      
      // Check if api is defined, otherwise fall back to individual API objects
      const tasksAPI = api?.tasks;
      const projectsAPI = api?.projects;
      const usersAPI = api?.users;
      
      // Fetch tasks, projects, and team members in parallel
      const [tasksData, projectsData, usersData] = await Promise.all([
        tasksAPI.getAll().catch((err: Error) => {
          console.error("Error fetching tasks:", err);
          return [];
        }),
        projectsAPI.getAll().catch((err: Error) => {
          console.error("Error fetching projects:", err);
          return [];
        }),
        usersAPI.getAll().catch((err: Error) => {
          console.error("Error fetching team members:", err);
          return [];
        })
      ])
      
      // Convert API responses to our internal types
      setTasks(tasksData.map((apiTask: TaskApiResponse) => adaptApiToTask(apiTask as any)));
      setProjects(projectsData.map((apiProject: ProjectApiResponse) => adaptApiToProject(apiProject)));
      setTeamMembers(usersData.map((apiUser: UserApiResponse) => adaptApiToUser(apiUser)));
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err)
      
      // Check if it's a connectivity issue
      if (err.message && (
          err.message.includes('Failed to fetch') || 
          err.message.includes('Network error') ||
          err.message.includes('connect to the server')
         )) {
        setIsConnected(false)
        setError("Connection to server failed. Please check your network or server status.")
      } else {
        setError(err?.message || "Failed to load dashboard data")
      }
      
      toast.error("Failed to load dashboard data")
      // Initialize with empty arrays to prevent undefined errors
      setTasks([])
      setProjects([])
      setTeamMembers([])
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = async () => {
    setIsRetrying(true)
    
    try {
      // Attempt to reconnect to the API
      const connected = await checkApiConnection(true)
      
      if (connected) {
        // Successfully reconnected, fetch data again
        setIsConnected(true)
        toast.success("Connection restored. Refreshing data...")
        await fetchData()
      } else {
        // Still not connected
        toast.error("Still unable to connect to the server")
      }
    } catch (error) {
      console.error("Error retrying connection:", error)
      toast.error("Connection attempt failed")
    } finally {
      setIsRetrying(false)
    }
  }

  // Calculate task statistics with null checks
  const getTotalTasks = () => tasks?.length || 0;
  const getInProgressTasks = () => tasks?.filter(task => task?.status === 'in-progress')?.length || 0;
  const getCompletedTasks = () => tasks?.filter(task => task?.status === 'done')?.length || 0;
  const getOverdueTasks = () => {
    if (!tasks || !Array.isArray(tasks)) return 0;
    
    const today = new Date();
    return tasks.filter(task => {
      if (!task || !task.dueDate) return false;
      try {
        const dueDate = new Date(task.dueDate);
        return dueDate < today && task?.status !== 'done';
      } catch (err) {
        console.error("Error parsing due date:", err);
        return false;
      }
    }).length;
  };

  // Handle creating new items
  const handleTaskCreated = (newTask: Task) => {
    // Add the new task to the tasks array
    setTasks(prevTasks => [...prevTasks, newTask]);
    
    // If the task is associated with a project, it will now be reflected in the project metrics
    // since the task is now part of the tasks array used for project filtering
    
    toast.success("Task created successfully");
  };

  const handleProjectCreated = (projectData: any) => {
    // Create a proper Project object with an ID
    const newProject: Project = {
      ...projectData,
      id: `project-${projects.length + 1}`, // Generate an ID if none exists
    };
    
    setProjects(prevProjects => [...prevProjects, newProject]);
    toast.success("Project created successfully");
  };

  // Add project update handler
  const handleProjectUpdated = (updatedProject: Project) => {
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === updatedProject.id ? updatedProject : project
      )
    );
    toast.success("Project updated successfully");
  };

  // Add project delete handler
  const handleProjectDeleted = async (projectId: string) => {
    try {
      const projectsAPI = api?.projects;
      const response = await projectsAPI.delete(projectId);
      console.log("Delete project response:", response);
      
      setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
      toast.success(response.message || "Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete project");
    } finally {
      setDeleteProjectId(null);
    }
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'
  }

  // Add task update and delete handlers
  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    toast.success("Task updated successfully");
  };

  const handleTaskDeleted = async (taskId: string) => {
    try {
      const tasksAPI = api?.tasks;
      await tasksAPI.delete(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      // Refresh analytics data
      refreshAnalytics();
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  // Function to check database status
  const checkDatabaseStatus = async (): Promise<'connected' | 'error' | 'unknown'> => {
    try {
      // Use the root URL for the health endpoint, not the /api path
      const backendBaseUrl = API_BASE_URL.replace('/api', '');
      const response = await fetch(`${backendBaseUrl}/health`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        return 'error';
      }
      
      const healthData = await response.json();
      return healthData.database?.status === 'connected' ? 'connected' : 'error';
    } catch (error) {
      console.error('Error checking database status:', error);
      return 'unknown';
    }
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        heading="Dashboard"
        subheading="Overview of your tasks and projects"
      />
      
      <div className="flex-1 p-8 pt-6">
        {!isConnected && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-md p-4 flex items-center">
            <WifiOff className="h-5 w-5 text-amber-500 mr-2" />
            <div className="flex-1 text-amber-700">
              <p className="font-medium">Connection to server unavailable</p>
              <p className="text-sm">You're currently viewing cached data. Some features may be limited.</p>
            </div>
            <Button 
              variant="outline" 
              className="ml-4 text-amber-700 border-amber-300 hover:bg-amber-100"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? "Checking..." : "Retry Connection"}
            </Button>
          </div>
        )}

        {error && !loading && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <div className="flex-1 text-red-700">
              <p className="font-medium">Error loading dashboard</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchData} 
              className="ml-4"
            >
              Retry
            </Button>
          </div>
        )}

        <div className="flex justify-end mb-4 space-x-2">
          <CreateTaskDialog onTaskCreated={handleTaskCreated} />
          <CreateProjectDialog onProjectCreated={handleProjectCreated} />
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <OverviewSection
                tasks={tasks}
                totalTasks={getTotalTasks()}
                inProgressTasks={getInProgressTasks()}
                completedTasks={getCompletedTasks()}
                overdueTasks={getOverdueTasks()}
                getInitials={getInitials}
              />
            </TabsContent>

            <TabsContent value="projects" className="space-y-6 mt-6">
              <ProjectsSection 
                projects={projects}
                tasks={tasks}
                onProjectDeleted={handleProjectDeleted}
                onProjectUpdated={handleProjectUpdated}
              />
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6 mt-6">
              <TasksSection
                tasks={tasks}
                projects={projects}
                onTaskUpdated={handleTaskUpdated}
                onTaskDeleted={handleTaskDeleted}
              />
            </TabsContent>
          </Tabs>
        )}

        {deleteProjectId && (
          <AlertDialog open={!!deleteProjectId} onOpenChange={() => setDeleteProjectId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to delete this project?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the project and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => deleteProjectId && handleProjectDeleted(deleteProjectId)}
                  className="bg-destructive text-destructive-foreground"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}

