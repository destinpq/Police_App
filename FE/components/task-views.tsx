"use client"

import { useState } from "react"
import { LayoutGrid, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TaskBoard } from "./task-board"
import { TaskCalendarView } from "./task-calendar-view"
import { Task } from "@/lib/types"

interface TaskViewsProps {
  tasks: Task[]
  onTaskCreated?: (task: Task) => void
  onTaskUpdated?: (task: Task) => void
  onTaskDeleted?: (taskId: string) => void
}

type ViewMode = "board" | "calendar"

export function TaskViews({ tasks, onTaskCreated, onTaskUpdated, onTaskDeleted }: TaskViewsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("board")
  
  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <div className="bg-muted rounded-lg p-1 inline-flex">
          <Button
            variant={viewMode === "board" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("board")}
            className="flex items-center gap-1"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Board</span>
          </Button>
          <Button
            variant={viewMode === "calendar" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("calendar")}
            className="flex items-center gap-1"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
          </Button>
        </div>
      </div>
      
      {viewMode === "board" ? (
        <TaskBoard
          initialTasks={tasks}
          onTaskCreated={onTaskCreated}
          onTaskUpdated={onTaskUpdated}
          onTaskDeleted={onTaskDeleted}
        />
      ) : (
        <TaskCalendarView
          tasks={tasks}
          onTaskCreated={onTaskCreated}
          onTaskUpdated={onTaskUpdated}
          onTaskDeleted={onTaskDeleted}
        />
      )}
    </div>
  )
} 