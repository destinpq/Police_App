"use client"

import { useState, useEffect } from "react"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { Button } from "@/components/ui/button"
import { fetchFromApi } from "@/lib/api-utils"
import api from "@/lib/api"
import { toast } from "sonner"
import { Task, TaskFormData } from "@/lib/types"
import { format } from "date-fns"
import { TaskCard } from "@/components/task-card"

interface TaskBoardProps {
  initialTasks?: Task[];
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (taskId: string) => void;
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
    
    // Process tags as string
    const processedTags = taskData.tags || undefined;
    
    // Properly handle assignee - ensure we're storing the ID, not an object
    let assigneeId = taskData.assignee || undefined;
    if (assigneeId && typeof assigneeId === 'object' && 'id' in assigneeId) {
      assigneeId = (assigneeId as any).id;
    }

    const newTask: Task = {
      id: taskData.id || `task-${tasks.length + 1}`,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      assigneeId: assigneeId,
      dueDate: taskData.dueDate 
        ? format(taskData.dueDate, 'yyyy-MM-dd')
        : undefined,
      projectId: taskData.project || undefined,
      tags: processedTags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setTasks([...tasks, newTask])
    
    // Notify parent component
    if (onTaskCreated) {
      onTaskCreated(newTask);
    }
  }

  // Handle task update
  const handleTaskUpdated = (updatedTask: Partial<Task>) => {
    // Ensure the dueDate is a string if it's a Date object
    let formattedDueDate: string | undefined = undefined;
    if (updatedTask.dueDate) {
      // Check if it looks like a Date object (has toLocaleDateString method)
      const dueDateValue = updatedTask.dueDate as unknown;
      if (typeof dueDateValue === 'object' && dueDateValue instanceof Date) {
        formattedDueDate = format(dueDateValue as Date, 'yyyy-MM-dd');
      } else {
        // It's already a string
        formattedDueDate = dueDateValue as string;
      }
    }
    
    // Handle assignee properly
    let formattedAssignee = undefined;
    let formattedAssigneeId = updatedTask.assigneeId;
    
    if (updatedTask.assignee) {
      if (typeof updatedTask.assignee === 'object' && updatedTask.assignee !== null) {
        // Keep assignee object format but ensure it has all required fields
        formattedAssignee = {
          id: updatedTask.assignee.id,
          name: updatedTask.assignee.name,
          email: updatedTask.assignee.email || '',
          avatar: updatedTask.assignee.avatar || undefined,
          role: updatedTask.assignee.role || undefined
        };
      }
    } else if (formattedAssigneeId) {
      // If assigneeId is an object, extract the ID from it
      if (typeof formattedAssigneeId === 'object' && formattedAssigneeId !== null && 'id' in formattedAssigneeId) {
        formattedAssigneeId = (formattedAssigneeId as any).id;
      }
    }

    const formattedTask: Task = {
      ...(tasks.find(t => t.id === updatedTask.id) as Task),
      ...updatedTask,
      dueDate: formattedDueDate,
      assignee: formattedAssignee,
      assigneeId: formattedAssigneeId,
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
  const moveTask = async (taskId: string, newStatus: Task["status"]) => {
    try {
      const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, status: newStatus };
        }
        return task;
      });
      
      // Update local state immediately for better UI response
      setTasks(updatedTasks);
      
      // Update in backend
      await api.tasks.update(taskId, { status: newStatus });
      
      // Optionally notify with toast
      toast.success(`Task moved to ${newStatus.replace('-', ' ')}`);
      
      // Notify parent component if needed
      const updatedTask = updatedTasks.find(t => t.id === taskId);
      if (updatedTask && onTaskUpdated) {
        onTaskUpdated(updatedTask);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status. Please try again.');
      
      // Revert the local state change on error
      setTasks(tasks);
    }
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

