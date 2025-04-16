
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
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
import { MoreVertical, Trash2 } from "lucide-react"
import { getAssigneeName } from "@/lib/task-adapter"
import { useTeam } from "@/contexts/team-context"
import { Task, User } from "@/lib/types"
import { TeamMember } from "@/contexts/team-context"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { format } from "date-fns"

interface TaskCardProps {
  task: Task
  onDragComplete?: (taskId: string) => void
  onTaskUpdated?: (task: Task) => void
  onTaskDeleted?: (taskId: string) => void
  projectId?: string
  columnId?: string
  teamMembers?: TeamMember[]
}

export const getPriorityColor = (priority: Task["priority"]) => {
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

// Safely get assignee name from any possible assignee data structure
export function safeGetAssigneeName(
  task: Task, 
  teamMembers: TeamMember[] | any[] = []
): string {
  // Case 1: Direct assignee object with name property
  if (task.assignee && typeof task.assignee === 'object' && task.assignee.name) {
    return task.assignee.name;
  }
  
  // Case 2: AssigneeId is an object with name property (incorrect but handled)
  if (task.assigneeId && typeof task.assigneeId === 'object' && (task.assigneeId as any).name) {
    return (task.assigneeId as any).name;
  }
  
  // Case 3: Use the assigneeId to lookup in team members
  if (task.assigneeId && typeof task.assigneeId === 'string') {
    return getAssigneeName(task.assigneeId, Array.isArray(teamMembers) ? teamMembers : []);
  }
  
  // Default case
  return 'Unassigned';
}

// Safely format any date type
export function safeFormatDate(dateValue: any): string {
  try {
    if (!dateValue) return 'No date';
    
    // Handle string dates
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString();
      }
    }
    
    // Handle Date objects - check using duck typing
    if (dateValue && typeof dateValue === 'object' && 
        typeof dateValue.getTime === 'function' && 
        typeof dateValue.toLocaleDateString === 'function') {
      return dateValue.toLocaleDateString();
    }
    
    // Handle ISO strings in objects
    if (typeof dateValue === 'object' && dateValue.toString) {
      const dateStr = dateValue.toString();
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString();
      }
    }
    
    // Fallback for anything else
    return String(dateValue).substring(0, 10); // Just take first 10 chars
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Invalid date';
  }
}

export function TaskCard({
  task,
  onDragComplete,
  onTaskUpdated,
  onTaskDeleted,
  projectId,
  columnId,
  teamMembers = [],
}: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id);
  };
  
  const handleDragEnd = (e: React.DragEvent) => {
    if (onDragComplete) {
      onDragComplete(task.id);
    }
  };

  // Helper functions to safely display task data
  const safeGetAssigneeName = (task: Task, teamMembers: TeamMember[]): string => {
    if (task.assignee && typeof task.assignee === 'object' && 'name' in task.assignee) {
      return task.assignee.name as string;
    }
    
    if (task.assigneeId) {
      if (typeof task.assigneeId === 'object' && 'name' in task.assigneeId) {
        return (task.assigneeId as any).name as string;
      }
      
      const member = teamMembers.find(m => m.id === task.assigneeId);
      return member?.name || 'Unassigned';
    }
    
    return 'Unassigned';
  };
  
  const safeFormatDate = (date: string | Date): string => {
    if (!date) return '';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, 'MMM d, yyyy');
    } catch (error) {
      return String(date);
    }
  };
  
  const renderTags = (): string[] => {
    if (!task.tags) return [];
    if (typeof task.tags === 'string') {
      return task.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }
    if (Array.isArray(task.tags)) {
      return (task.tags as any[]).map((tag: any) => typeof tag === 'string' ? tag : String(tag)).filter(Boolean);
    }
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
                      task={task as any}
                      onTaskUpdated={onTaskUpdated as any}
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
            {(task.project || task.projectId) && (
              <>
                <span>•</span>
                <span className="truncate">
                  {typeof task.project === 'object' && task.project?.name 
                    ? String(task.project.name)
                    : typeof task.projectId === 'object' && (task.projectId as any)?.name
                      ? String((task.projectId as any).name)
                      : typeof task.projectId === 'string' 
                        ? task.projectId 
                        : ''}
                </span>
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
        <CardFooter className="p-4 pt-0 flex flex-col items-start gap-1">
          <div className="text-xs text-muted-foreground flex flex-col gap-0.5 w-full">
            <div className="flex items-center justify-between">
              <div>Assigned to: {safeGetAssigneeName(task, teamMembers)}</div>
              {task.dueDate && <div>Due: {safeFormatDate(task.dueDate)}</div>}
            </div>
          </div>
        </CardFooter>
      </Card>
      
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteTask}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 