"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardChart } from "@/components/dashboard-chart"
import { TaskSummary } from "@/components/task-summary"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import api from "@/lib/api"
import { toast } from "sonner"
import { EditProjectDialog } from "@/components/edit-project-dialog"
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
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { EditTaskDialog } from "@/components/edit-task-dialog"

// Define interfaces for data types
interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role?: string
}

interface Task {
  id?: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  assignee?: string
  dueDate?: string | Date
  project?: string
  tags?: string[] | string
}

interface Project {
  id: string
  name: string
  description: string
  status: string
  priority: string
  startDate?: string | Date
  endDate?: string | Date
  manager?: string
  department?: string
  budget?: string
  tags?: string[] | string
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch tasks, projects, and team members in parallel
      const [tasksData, projectsData, teamMembersData] = await Promise.all([
        api.tasks.getAll(),
        api.projects.getAll(),
        api.teamMembers.getAll()
      ])
      
      setTasks(tasksData as Task[])
      setProjects(projectsData as Project[])
      setTeamMembers(teamMembersData as TeamMember[])
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err)
      setError(err?.message || "Failed to load dashboard data")
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  // Calculate task statistics
  const getTotalTasks = () => tasks.length;
  const getInProgressTasks = () => tasks.filter(task => task.status === 'in-progress').length;
  const getCompletedTasks = () => tasks.filter(task => task.status === 'done').length;
  const getOverdueTasks = () => {
    const today = new Date();
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
      return dueDate < today && task.status !== 'done';
    }).length;
  };

  // Handle creating new items
  const handleTaskCreated = (newTask: Task) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const handleProjectCreated = (projectData: any) => {
    // Create a proper Project object with an ID
    const newProject: Project = {
      ...projectData,
      id: `project-${projects.length + 1}`, // Generate an ID if none exists
    };
    
    setProjects(prevProjects => [...prevProjects, newProject]);
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
      const response = await api.projects.delete(projectId);
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

  // Get team member by ID
  const getTeamMember = (id: string) => {
    return teamMembers.find(member => member.id === id) || null
  }

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
      await api.tasks.delete(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <CreateTaskDialog 
            buttonVariant="outline" 
            onTaskCreated={handleTaskCreated}
          />
          <CreateProjectDialog 
            buttonVariant="outline"
            onProjectCreated={handleProjectCreated}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 border border-red-200 rounded bg-red-50">
          Error loading data: {error}
        </div>
      ) : (
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <TaskSummary title="Total Tasks" value={getTotalTasks().toString()} description="All tasks" trend="" />
              <TaskSummary title="In Progress" value={getInProgressTasks().toString()} description="Active tasks" trend="" />
              <TaskSummary title="Completed" value={getCompletedTasks().toString()} description="All time" trend="" />
              <TaskSummary
                title="Overdue"
                value={getOverdueTasks().toString()}
                description="Needs attention"
                trend=""
                trendDirection="down"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Task Completion</CardTitle>
                  <CardDescription>Tasks completed over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <DashboardChart />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Activity</CardTitle>
                  <CardDescription>Recent activity from your team</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tasks.slice(0, 4).map((task, i) => {
                      const assignee = task.assignee ? getTeamMember(task.assignee) : null
                      
                      return (
                        <div key={i} className="flex items-center gap-4">
                          <Avatar className="h-9 w-9">
                            {assignee && assignee.avatar ? (
                              <AvatarImage src={assignee.avatar} />
                            ) : null}
                            <AvatarFallback>
                              {assignee ? getInitials(assignee.name) : '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {assignee ? assignee.name : 'Unassigned'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {task.status === 'done' ? 'Completed' : 'Working on'} {task.title}
                            </p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Tasks and projects due soon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-4 border-b px-4 py-3 font-medium">
                    <div className="col-span-2">Item</div>
                    <div className="col-span-1">Type</div>
                    <div className="col-span-1">Due Date</div>
                  </div>

                  {tasks
                    .filter(task => task.dueDate && task.status !== 'done')
                    .sort((a, b) => {
                      // Safe handling of dates with type checking
                      if (!a.dueDate) return 1;
                      if (!b.dueDate) return -1;
                      const dateA = a.dueDate instanceof Date ? a.dueDate : new Date(a.dueDate);
                      const dateB = b.dueDate instanceof Date ? b.dueDate : new Date(b.dueDate);
                      return dateA.getTime() - dateB.getTime();
                    })
                    .slice(0, 4)
                    .map((task, i) => (
                      <div key={i} className="grid grid-cols-4 border-b px-4 py-3 last:border-0">
                        <div className="col-span-2 font-medium">{task.title}</div>
                        <div className="col-span-1">
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                            Task
                          </span>
                        </div>
                        <div className="col-span-1 text-muted-foreground">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.length === 0 ? (
                <div className="md:col-span-2 lg:col-span-3 p-8 text-center text-muted-foreground border border-dashed rounded-md">
                  No projects found. Create a new project to get started.
                </div>
              ) : (
                projects.map((project, i) => {
                  // Calculate project stats
                  const projectTasks = tasks.filter(task => task.project === `project${i+1}`);
                  const completedTasks = projectTasks.filter(task => task.status === 'done').length;
                  const progress = projectTasks.length ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
                  
                  return (
                    <Card key={project.id || i}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle>{project.name}</CardTitle>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <EditProjectDialog
                                  project={project}
                                  onProjectUpdated={handleProjectUpdated}
                                  buttonVariant="ghost"
                                  buttonSize="sm"
                                  buttonIcon={false}
                                />
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteProjectId(project.id || '')}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <CardDescription>
                          {completedTasks} of {projectTasks.length} tasks completed
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <div>Progress</div>
                            <div>{progress}%</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6 mt-6">
            <div className="rounded-md border">
              <div className="grid grid-cols-6 border-b px-4 py-3 font-medium">
                <div className="col-span-2">Task</div>
                <div className="col-span-1">Project</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1">Priority</div>
                <div className="col-span-1">Due Date</div>
              </div>

              {tasks.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">No tasks found. Create a new task to get started.</div>
              ) : (
                tasks.map((task, i) => (
                  <div key={task.id || i} className="grid grid-cols-6 border-b px-4 py-3 last:border-0">
                    <div className="col-span-2 font-medium">{task.title}</div>
                    <div className="col-span-1 text-muted-foreground">{task.project || '-'}</div>
                    <div className="col-span-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          task.status === "todo"
                            ? "bg-blue-100 text-blue-800"
                            : task.status === "in-progress"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {task.status === "todo" ? "To Do" : task.status === "in-progress" ? "In Progress" : "Done"}
                      </span>
                    </div>
                    <div className="col-span-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          task.priority === "high"
                            ? "bg-rose-100 text-rose-800"
                            : task.priority === "medium"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}
                      </span>
                      <div className="flex items-center gap-1">
                        <EditTaskDialog
                          task={task as any}
                          onTaskUpdated={handleTaskUpdated as any}
                          buttonVariant="ghost"
                          buttonSize="icon"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive h-8 w-8"
                          onClick={() => task.id && handleTaskDeleted(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
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
  )
}

