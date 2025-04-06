"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { fetchFromApi } from "@/lib/api-utils"

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

interface TaskBoardProps {
  initialTasks?: Task[]
  onTaskCreated?: (task: Task) => void
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

export function TaskBoard({ initialTasks = [], onTaskCreated }: TaskBoardProps) {
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

  const handleTaskCreated = (taskData: any) => {
    console.log('TaskBoard: Creating new task:', taskData);
    
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
      tags: taskData.tags ? taskData.tags.split(",").map((tag: string) => tag.trim()) : [],
    }

    setTasks([...tasks, newTask])
    
    // Notify parent component
    if (onTaskCreated) {
      onTaskCreated(newTask);
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
            />
          ))}
          {todoTasks.length === 0 && (
            <div className="p-4 text-center text-muted-foreground border border-dashed rounded-md">No tasks to do</div>
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
            />
          ))}
          {inProgressTasks.length === 0 && (
            <div className="p-4 text-center text-muted-foreground border border-dashed rounded-md">
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
            />
          ))}
          {doneTasks.length === 0 && (
            <div className="p-4 text-center text-muted-foreground border border-dashed rounded-md">
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
}

function TaskCard({ task, onDragComplete }: TaskCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id);
  };
  
  const handleDragEnd = (e: React.DragEvent) => {
    if (onDragComplete) {
      onDragComplete(task.id);
    }
  };

  // Parse tags - handle both string and array formats
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
    
    // Fallback
    return [];
  };

  return (
    <Card 
      className="shadow-sm hover:shadow transition-shadow cursor-pointer"
      draggable={!!onDragComplete}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base line-clamp-1">{task.title}</CardTitle>
          <div className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`} />
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
  )
}

