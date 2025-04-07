"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
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
import { fetchFromApi } from "@/lib/api-utils"
import api from "@/lib/api"
import { toast } from "sonner"

interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high"
  assignee?: string
  dueDate?: string 
  project?: string
  tags?: string[] | string
}

interface TaskFormData {
  id?: string
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high"
  assignee?: string
  dueDate?: Date
  project?: string
  tags?: string | string[]
  estimatedHours?: string
}

interface TaskBoardProps {
  initialTasks?: Task[]
  onTaskCreated?: (task: Task) => void
  onTaskUpdated?: (task: Task) => void
  onTaskDeleted?: (taskId: string) => void
}

const getPriorityColor = (priority: Task["priority"]) => {
  switch (priority) {
    case "high":
      return "bg-rose-500"
    case "medium":
      return "bg-amber-500"
    case "low":
      return "bg-emerald-500"
    default:
      return "bg-slate-500"
  }
}

export function TaskBoard({ initialTasks = [], onTaskCreated, onTaskUpdated, onTaskDeleted }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  // Update local state when initialTasks prop changes
  useEffect(() => {
    if (initialTasks && initialTasks.length > 0) {
      console.log('TaskBoard: Updating tasks from props:', initialTasks);
      setTasks(initialTasks);
    }
  }, [initialTasks])

  const todoTasks = tasks.filter((task) => task.status === "todo")
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress")
  const doneTasks = tasks.filter((task) => task.status === "done")

  const handleTaskCreated = (taskData: TaskFormData) => {
    console.log('TaskBoard: Creating new task:', taskData);
    
    // Process tags based on their type
    let processedTags: string[] = [];
    if (taskData.tags) {
      if (typeof taskData.tags === 'string') {
        processedTags = taskData.tags.split(",").map((tag: string) => tag.trim());
      } else if (Array.isArray(taskData.tags)) {
        processedTags = taskData.tags as string[];
      }
    }

    const newTask: Task = {
      id: taskData.id || `task-${tasks.length + 1}`,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      assignee: taskData.assignee,
      dueDate: taskData.dueDate 
        ? new Date(taskData.dueDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : undefined,
      project: taskData.project,
      tags: processedTags,
    }

    setTasks([...tasks, newTask])
    
    // Notify parent component
    if (onTaskCreated) {
      onTaskCreated(newTask);
    }
  }

  // Handle task update
  const handleTaskUpdated = (updatedTask: any) => {
    // Ensure the dueDate is a string if it's a Date
    const formattedTask: Task = {
      ...updatedTask,
      dueDate: updatedTask.dueDate instanceof Date 
        ? updatedTask.dueDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }) 
        : updatedTask.dueDate,
    };

    const updatedTasks = tasks.map(task => 
      task.id === formattedTask.id ? formattedTask : task
    );
    setTasks(updatedTasks);
    
    // Notify parent component
    if (onTaskUpdated) {
      onTaskUpdated(formattedTask);
    }
  }
  
  // Handle task deletion
  const handleTaskDeleted = async (taskId: string) => {
    try {
      // Delete from API
      const response = await api.tasks.delete(taskId);
      console.log("Delete response:", response);
      
      // Update local state
      setTasks(tasks.filter(task => task.id !== taskId));
      
      // Notify parent component
      if (onTaskDeleted) {
        onTaskDeleted(taskId);
      }
      
      toast.success(response.message || "Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete task");
    }
  }

  // Handle drag and drop
  const moveTask = (taskId: string, newStatus: Task["status"]) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        // Update in backend
        fetchFromApi(`tasks/${taskId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: newStatus }),
        }).catch(err => console.error('Error updating task status:', err));
        
        // Return updated task for local state
        return { ...task, status: newStatus };
      }
      return task;
    });
    
    setTasks(updatedTasks);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto">
      <div className="space-y-4 min-w-[280px]">
        <div className="flex items-center justify-between">
          <div className="font-medium text-lg">To Do</div>
          <CreateTaskDialog
            buttonVariant="ghost"
            buttonSize="sm"
            onTaskCreated={(data) => handleTaskCreated({ ...data, status: "todo" })}
          />
        </div>
        <div className="space-y-3 min-h-[200px]">
          {todoTasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onDragComplete={(taskId) => moveTask(taskId, "in-progress")}
              onTaskUpdated={handleTaskUpdated}
              onTaskDeleted={handleTaskDeleted}
            />
          ))}
          {todoTasks.length === 0 && (
            <div key="empty-todo" className="p-4 text-center text-muted-foreground border border-dashed rounded-md">No tasks to do</div>
          )}
        </div>
      </div>

      <div className="space-y-4 min-w-[280px]">
        <div className="flex items-center justify-between">
          <div className="font-medium text-lg">In Progress</div>
          <CreateTaskDialog
            buttonVariant="ghost"
            buttonSize="sm"
            onTaskCreated={(data) => handleTaskCreated({ ...data, status: "in-progress" })}
          />
        </div>
        <div className="space-y-3 min-h-[200px]">
          {inProgressTasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onDragComplete={(taskId) => moveTask(taskId, "done")}
              onTaskUpdated={handleTaskUpdated}
              onTaskDeleted={handleTaskDeleted}
            />
          ))}
          {inProgressTasks.length === 0 && (
            <div key="empty-in-progress" className="p-4 text-center text-muted-foreground border border-dashed rounded-md">
              No tasks in progress
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 min-w-[280px]">
        <div className="flex items-center justify-between">
          <div className="font-medium text-lg">Done</div>
          <CreateTaskDialog
            buttonVariant="ghost"
            buttonSize="sm"
            onTaskCreated={(data) => handleTaskCreated({ ...data, status: "done" })}
          />
        </div>
        <div className="space-y-3 min-h-[200px]">
          {doneTasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task}
              onTaskUpdated={handleTaskUpdated}
              onTaskDeleted={handleTaskDeleted}
            />
          ))}
          {doneTasks.length === 0 && (
            <div key="empty-done" className="p-4 text-center text-muted-foreground border border-dashed rounded-md">
              No completed tasks
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface TaskCardProps {
  task: Task
  onDragComplete?: (taskId: string) => void
  onTaskUpdated?: (task: Task) => void
  onTaskDeleted?: (taskId: string) => void
}

function TaskCard({ task, onDragComplete, onTaskUpdated, onTaskDeleted }: TaskCardProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id);
  };
  
  const handleDragEnd = (e: React.DragEvent) => {
    if (onDragComplete) {
      onDragComplete(task.id);
    }
  };

  // Parse tags - handle all possible formats
  const renderTags = () => {
    if (!task.tags) return [];
    
    // If tags is a string, split it
    if (typeof task.tags === 'string') {
      return task.tags.split(',').map((tag: string) => tag.trim());
    }
    
    // If already an array, use it
    if (Array.isArray(task.tags)) {
      return task.tags;
    }
    
    // If it's another type, return empty array
    return [];
  };
  
  const handleDeleteTask = () => {
    if (onTaskDeleted) {
      onTaskDeleted(task.id);
    }
    setShowDeleteAlert(false);
  };

  return (
    <>
      <Card 
        className="shadow-sm hover:shadow transition-shadow cursor-pointer group"
        draggable={!!onDragComplete}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base line-clamp-1">{task.title}</CardTitle>
            <div className="flex items-center">
              <div className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <EditTaskDialog
                      task={task}
                      onTaskUpdated={onTaskUpdated}
                      buttonVariant="ghost"
                      buttonSize="sm"
                      buttonIcon={false}
                    />
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={() => setShowDeleteAlert(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <CardDescription className="text-xs flex items-center gap-2">
            <span>Priority: {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
            {task.project && (
              <>
                <span>•</span>
                <span className="truncate">{task.project}</span>
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm line-clamp-2">{task.description}</p>

          {task.tags && (
            <div className="flex flex-wrap gap-1 mt-2">
              {renderTags().map((tag: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground flex justify-between">
          <div className="truncate">{task.assignee}</div>
          {task.dueDate && <div>Due: {task.dueDate}</div>}
        </CardFooter>
      </Card>
      
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

