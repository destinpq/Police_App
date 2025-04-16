"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  CalendarIcon, 
  Clock, 
  Pencil, 
  Plus, 
  Tag, 
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { EditTaskDialog } from "@/components/edit-task-dialog"
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
import { toast } from "sonner"
import api from "@/lib/api"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { refreshAnalytics } from "@/lib/api-utils"
import { Task, User, Project, TaskFormData } from "@/lib/types"
import { ProjectTeamDialog } from "@/components/project-team-dialog"

type TeamMember = User

export default function ProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)

  useEffect(() => {
    if (projectId) {
      fetchProjectData()
    }
  }, [projectId])

  const fetchProjectData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch project details, stats, tasks, and team members in parallel
      const [projectBasicData, projectStatsData, projectTasks, teamMembersData] = await Promise.all([
        api.projects.getById(projectId),
        api.projects.getStats(projectId),
        api.projects.getTasks(projectId),
        api.teamMembers.getAll()
      ])
      
      // Combine project data with stats
      const fullProjectData: Project = {
        ...projectBasicData,
        taskStats: projectStatsData.taskStats
      }
      
      setProject(fullProjectData)
      setTasks(projectTasks.map(task => ({
        ...task,
        status: task.status as "todo" | "in-progress" | "done",
        priority: task.priority as "low" | "medium" | "high"
      })))
      setTeamMembers(teamMembersData)
    } catch (err: any) {
      console.error("Error fetching project data:", err)
      setError(err?.message || "Failed to load project data")
      toast.error("Failed to load project data")
    } finally {
      setLoading(false)
    }
  }

  const handleTaskCreated = (newTask: TaskFormData) => {
    // Only add the task if it belongs to this project
    if (newTask.project === projectId) {
      const task: Task = {
        id: newTask.id || crypto.randomUUID(),
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        priority: newTask.priority,
        assigneeId: newTask.assignee || null,
        projectId: newTask.project || null,
        dueDate: newTask.dueDate?.toISOString() || null,
        tags: newTask.tags || null,
        estimatedHours: newTask.estimatedHours || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setTasks(prevTasks => [...prevTasks, task])
      toast.success("Task created successfully")
      
      // Update project stats
      if (project && project.taskStats) {
        setProject({
          ...project,
          taskStats: {
            ...project.taskStats,
            totalTasks: project.taskStats.totalTasks + 1,
            progress: calculateProgress([...tasks, task])
          }
        })
      }
    }
  }

  const handleTaskUpdated = (updatedTask: TaskFormData) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === updatedTask.id 
          ? {
              ...task,
              title: updatedTask.title,
              description: updatedTask.description,
              status: updatedTask.status,
              priority: updatedTask.priority,
              assigneeId: updatedTask.assignee || null,
              projectId: updatedTask.project || null,
              dueDate: updatedTask.dueDate?.toISOString() || null,
              tags: updatedTask.tags || null,
              estimatedHours: updatedTask.estimatedHours || null,
              updatedAt: new Date().toISOString()
            }
          : task
      )
    )
    toast.success("Task updated successfully")
    
    // Update project stats if status changed (may affect completion count)
    if (project && project.taskStats) {
      const updatedTasks = tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
      
      setProject({
        ...project,
        taskStats: {
          ...project.taskStats,
          completedTasks: updatedTasks.filter(t => t.status === 'done').length,
          progress: calculateProgress(updatedTasks)
        }
      })
    }
  }

  const handleTaskDeleted = async (taskId: string) => {
    try {
      await api.tasks.delete(taskId)
      
      // Remove the task from the tasks array
      const updatedTasks = tasks.filter(task => task.id !== taskId)
      setTasks(updatedTasks)
      
      // Update project stats
      if (project && project.taskStats) {
        setProject({
          ...project,
          taskStats: {
            ...project.taskStats,
            totalTasks: project.taskStats.totalTasks - 1,
            completedTasks: updatedTasks.filter(t => t.status === 'done').length,
            progress: calculateProgress(updatedTasks)
          }
        })
      }
      
      // Refresh analytics data
      refreshAnalytics()
      
      toast.success("Task deleted successfully")
    } catch (error) {
      console.error("Error deleting task:", error)
      toast.error("Failed to delete task")
    } finally {
      setDeleteTaskId(null)
    }
  }

  const calculateProgress = (taskList: Task[]) => {
    if (!taskList.length) return 0
    const completedCount = taskList.filter(t => t.status === 'done').length
    return Math.round((completedCount / taskList.length) * 100)
  }

  const getTeamMember = (id: string) => {
    return teamMembers.find(member => member.id === id)
  }

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'No date'
    return new Date(date).toLocaleDateString()
  }

  // Get priority color class
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-amber-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo':
        return 'To Do'
      case 'in-progress':
        return 'In Progress'
      case 'done':
        return 'Done'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  // Get status color class
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-blue-100 text-blue-800'
      case 'in-progress':
        return 'bg-amber-100 text-amber-800'
      case 'done':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-200 rounded bg-red-50">
        Error loading project: {error}
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center p-8 border border-dashed rounded-md">
        Project not found
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <Badge variant="outline" className="ml-2">
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
        </div>
        <div className="flex gap-2">
          <ProjectTeamDialog 
            projectId={projectId} 
            onTeamUpdated={fetchProjectData}
          />
          <CreateTaskDialog 
            buttonVariant="outline" 
            onTaskCreated={handleTaskCreated}
            projectId={projectId}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{project.description}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Start: {formatDate(project.startDate)}</span>
              </div>
              {project.endDate && (
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">End: {formatDate(project.endDate)}</span>
                </div>
              )}
              {project.manager && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Manager: {project.manager}</span>
                </div>
              )}
              {project.budget && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Budget: {project.budget}</span>
                </div>
              )}
              {project.tags && (
                <div className="flex items-center gap-2 col-span-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Tags: {typeof project.tags === 'string' ? project.tags : project.tags.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>
              {project.taskStats?.completedTasks || 0} of {project.taskStats?.totalTasks || 0} tasks completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-2 w-full rounded-full bg-muted">
                <div 
                  className="h-2 rounded-full bg-primary" 
                  style={{ width: `${project.taskStats?.progress || 0}%` }} 
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <div>Progress</div>
                <div>{project.taskStats?.progress || 0}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>All tasks in this project</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="todo">To Do</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="done">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {renderTaskList(tasks)}
            </TabsContent>
            
            <TabsContent value="todo" className="mt-4">
              {renderTaskList(tasks.filter(task => task.status === 'todo'))}
            </TabsContent>
            
            <TabsContent value="in-progress" className="mt-4">
              {renderTaskList(tasks.filter(task => task.status === 'in-progress'))}
            </TabsContent>
            
            <TabsContent value="done" className="mt-4">
              {renderTaskList(tasks.filter(task => task.status === 'done'))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {deleteTaskId && (
        <AlertDialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this task. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteTaskId && handleTaskDeleted(deleteTaskId)}
                className="bg-destructive text-destructive-foreground"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )

  function renderTaskList(taskList: Task[]) {
    if (taskList.length === 0) {
      return (
        <div className="text-center py-6 border border-dashed rounded-md">
          No tasks found in this category
        </div>
      )
    }

    // Helper function to get initials from a name
    const getInitials = (name: string) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    return (
      <div className="rounded-md border">
        <div className="grid grid-cols-12 border-b px-4 py-3 font-medium">
          <div className="col-span-4">Task</div>
          <div className="col-span-2">Assignee</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Priority</div>
          <div className="col-span-2">Due Date</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {taskList.map((task) => (
          <div key={task.id} className="grid grid-cols-12 border-b px-4 py-3 last:border-0">
            <div className="col-span-4 font-medium">
              <div>{task.title}</div>
              <div className="text-xs text-muted-foreground line-clamp-1 mt-1">{task.description}</div>
            </div>
            <div className="col-span-2">
              {task.assignee ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    {task.assignee.avatar ? (
                      <AvatarImage src={task.assignee.avatar} />
                    ) : null}
                    <AvatarFallback className="text-xs">
                      {typeof task.assignee === 'object' && task.assignee.name 
                        ? getInitials(task.assignee.name) 
                        : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm truncate">
                    {typeof task.assignee === 'object' && task.assignee.name 
                      ? task.assignee.name 
                      : typeof task.assignee === 'string' 
                        ? task.assignee 
                        : "Unknown"}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Unassigned</span>
              )}
            </div>
            <div className="col-span-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(task.status)}`}
              >
                {getStatusLabel(task.status)}
              </span>
            </div>
            <div className="col-span-1">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`} />
                <span className="text-sm">{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
              </div>
            </div>
            <div className="col-span-2 text-muted-foreground">
              {formatDate(task.dueDate)}
            </div>
            <div className="col-span-1 flex justify-end gap-1">
              <EditTaskDialog
                task={task as any}
                onTaskUpdated={handleTaskUpdated}
                buttonVariant="ghost"
                buttonSize="icon"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-destructive"
                onClick={() => task.id && setDeleteTaskId(task.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    )
  }
} 