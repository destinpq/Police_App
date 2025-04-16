"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { TaskViews } from "@/components/task-views"
import { Task, TaskApiResponse } from "@/lib/types"
import { adaptApiToTask } from "@/lib/task-adapter"
import api from "@/lib/api"
import { toast } from "sonner"
import { fetchApi } from "@/lib/api-core"

// Mock data to use when backend is unavailable
const MOCK_TASKS: Task[] = [
  {
    id: 'mock-task-1',
    title: 'Complete project setup',
    description: 'Configure development environment and install dependencies',
    status: 'todo',
    priority: 'high',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
  },
  {
    id: 'mock-task-2',
    title: 'Design database schema',
    description: 'Create tables and relationships for the application database',
    status: 'in-progress',
    priority: 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
  },
  {
    id: 'mock-task-3',
    title: 'Implement authentication',
    description: 'Add user login and registration functionality',
    status: 'done',
    priority: 'high',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  }
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  
  // Load tasks on initial render
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        
        // Try to connect to the API with retry logic
        let retries = 3;
        let response;
        let error;
        
        while (retries > 0) {
          try {
            response = await fetch('http://localhost:3001/api/tasks', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store'
              },
              cache: 'no-store'
            });
            
            // If successful, break out of retry loop
            break;
          } catch (err) {
            // Store the error for potential later use
            error = err;
            console.log(`API connection attempt failed, ${retries - 1} retries left`);
            retries--;
            // Wait 1 second before retrying
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
        
        // If we still don't have a response after all retries
        if (!response) {
          console.warn('Backend is not available, using mock data instead');
          toast.warning('Backend server is not running. Using mock data instead.');
          setTasks(MOCK_TASKS);
          setLoading(false);
          return;
        }
        
        if (!response.ok) {
          throw new Error(`Error fetching tasks: ${response.status}`);
        }
        
        const tasksData = await response.json();
        console.log('Raw tasks data from API:', tasksData);
        
        // Convert API response to Task objects
        const adaptedTasks = (tasksData as TaskApiResponse[]).map(adaptApiToTask);
        console.log('Adapted tasks:', adaptedTasks);
        
        setTasks(adaptedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error)
        toast.error("Failed to load tasks. Using mock data instead.")
        // Fallback to mock data when the API fails
        setTasks(MOCK_TASKS);
      } finally {
        setLoading(false)
      }
    }
    
    fetchTasks()
  }, [])
  
  // Task handlers
  const handleTaskCreated = (task: Task) => {
    setTasks(prev => [...prev, task])
    // Force reload of data
    fetchTasks()
  }
  
  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(prev => 
      prev.map(task => task.id === updatedTask.id ? updatedTask : task)
    )
  }
  
  const handleTaskDeleted = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }
  
  // Function to force reload tasks
  const fetchTasks = async () => {
    try {
      setLoading(true)
      
      // Try to connect to the API with retry logic
      let retries = 3;
      let response;
      let error;
      
      while (retries > 0) {
        try {
          response = await fetch('http://localhost:3001/api/tasks', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store'
            },
            cache: 'no-store'
          });
          
          // If successful, break out of retry loop
          break;
        } catch (err) {
          // Store the error for potential later use
          error = err;
          console.log(`API connection attempt failed, ${retries - 1} retries left`);
          retries--;
          // Wait 1 second before retrying
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      // If we still don't have a response after all retries
      if (!response) {
        console.warn('Backend is not available, using mock data instead');
        toast.warning('Backend server is not running. Using mock data instead.');
        setTasks(MOCK_TASKS);
        setLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Error fetching tasks: ${response.status}`);
      }
      
      const tasksData = await response.json();
      console.log('Raw tasks data from API:', tasksData);
      
      // Convert API response to Task objects
      const adaptedTasks = (tasksData as TaskApiResponse[]).map(adaptApiToTask);
      console.log('Adapted tasks:', adaptedTasks);
      
      setTasks(adaptedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast.error("Failed to load tasks. Using mock data instead.")
      // Fallback to mock data when the API fails
      setTasks(MOCK_TASKS);
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        heading="Task Management"
        subheading="Create, assign, and manage your tasks"
      />
      
      <div className="flex-1 p-8 pt-6">
        <div className="mb-4">
          <button 
            onClick={fetchTasks}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Refresh Tasks
          </button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-2">Loading tasks...</span>
          </div>
        ) : (
          <TaskViews
            tasks={tasks}
            onTaskCreated={handleTaskCreated}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
          />
        )}
      </div>
    </div>
  )
}

