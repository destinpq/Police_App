"use client"

import { useState, useMemo } from "react"
import { format, isValid, isSameDay, addMonths, parseISO, isAfter, isBefore, isEqual } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { EditTaskDialog } from "./edit-task-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Task, TaskFormData } from "@/lib/types"

interface TaskCalendarViewProps {
  tasks: Task[]
  onTaskCreated?: (task: Task) => void
  onTaskUpdated?: (task: Task) => void
  onTaskDeleted?: (taskId: string) => void
}

const priorityToColor = {
  high: "bg-rose-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500"
}

const statusColor = {
  "todo": "bg-blue-500",
  "in-progress": "bg-orange-500",
  "done": "bg-green-500"
}

export function TaskCalendarView({ tasks, onTaskCreated, onTaskUpdated, onTaskDeleted }: TaskCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined)
  
  // Group tasks by date - include all relevant dates, not just due date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {}
    const today = new Date()
    
    tasks.forEach(task => {
      if (!task) return // Skip null or undefined tasks
      
      // Handle "todo" tasks - they're relevant from today until due date
      if (task.status === "todo") {
        // Get due date as Date object if it exists
        let dueDate: Date | null = null
        if (task.dueDate) {
          try {
            dueDate = typeof task.dueDate === 'string'
              ? new Date(task.dueDate)
              : null
          } catch (error) {
            console.error("Error parsing due date:", error)
          }
        }
        
        // If we have a valid due date
        if (dueDate && isValid(dueDate)) {
          // Add to all dates from today (or created date) until due date
          const startDate = new Date(today)
          startDate.setHours(0, 0, 0, 0) // Start of today
          
          // For dates in current and next month
          for (let d = new Date(startDate); !isAfter(d, dueDate); d.setDate(d.getDate() + 1)) {
            const dateKey = format(d, 'yyyy-MM-dd')
            if (!grouped[dateKey]) {
              grouped[dateKey] = []
            }
            // Avoid duplicates
            if (!grouped[dateKey].some(t => t.id === task.id)) {
              grouped[dateKey].push(task)
            }
          }
        }
      }
      
      // All tasks (regardless of status) appear on their due date if available
      if (task.dueDate) {
        try {
          const dueDateStr = typeof task.dueDate === 'string' 
            ? task.dueDate.split('T')[0]  // Handle ISO format or just get the string
            : ''
            
          // Skip invalid dates
          if (!dueDateStr) return
            
          if (!grouped[dueDateStr]) {
            grouped[dueDateStr] = []
          }
          // Avoid duplicates
          if (!grouped[dueDateStr].some(t => t.id === task.id)) {
            grouped[dueDateStr].push(task)
          }
        } catch (error) {
          console.error("Error processing task date:", error)
        }
      }
      
      // "In progress" tasks should appear on today's date too
      if (task.status === "in-progress") {
        const todayStr = format(today, 'yyyy-MM-dd')
        if (!grouped[todayStr]) {
          grouped[todayStr] = []
        }
        // Avoid duplicates
        if (!grouped[todayStr].some(t => t.id === task.id)) {
          grouped[todayStr].push(task)
        }
      }
    })
    
    return grouped
  }, [tasks])
  
  // Get tasks for selected day
  const selectedDayTasks = useMemo(() => {
    if (!selectedDay) return []
    
    try {
      const dateKey = format(selectedDay, 'yyyy-MM-dd')
      return tasksByDate[dateKey] || []
    } catch (error) {
      console.error("Error getting selected day tasks:", error)
      return []
    }
  }, [selectedDay, tasksByDate])
  
  // Define day content renderer
  const renderDayContents = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd')
    const dayTasks = tasksByDate[dateKey] || []
    
    return (
      <div className="relative w-full h-full">
        <div className="absolute -bottom-1 left-0 right-0 flex justify-center gap-0.5">
          {dayTasks.length > 0 && (
            <div className="flex gap-1 items-center">
              {dayTasks.slice(0, Math.min(3, dayTasks.length)).map((task, i) => (
                <div 
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${statusColor[task.status] || 'bg-gray-400'}`}
                  aria-hidden="true"
                />
              ))}
              {dayTasks.length > 3 && (
                <div className="text-[8px] text-muted-foreground">
                  +{dayTasks.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
  
  // Handle form data conversion
  const handleTaskFormSubmit = (formData: TaskFormData) => {
    if (!onTaskCreated) return
    
    // Generate an ID if one wasn't provided
    const taskId = formData.id || `task-${Date.now()}`
    
    const newTask: Task = {
      id: taskId,
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      assigneeId: formData.assignee || null,
      dueDate: formData.dueDate 
        ? format(formData.dueDate, 'yyyy-MM-dd')
        : null,
      tags: formData.tags || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    onTaskCreated(newTask)
  }
  
  // Handlers for month navigation
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => addMonths(prev, -1))
  }
  
  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1))
  }
  
  const handleDayClick = (day: Date | undefined) => {
    setSelectedDay(day)
  }
  
  // Function to check if a task is due on the selected day
  const isTaskDueOnDay = (task: Task, day: Date): boolean => {
    if (!task.dueDate) return false
    try {
      const dueDate = new Date(task.dueDate)
      return isSameDay(dueDate, day)
    } catch (e) {
      return false
    }
  }
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-medium text-xl">Task Calendar</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-medium">
            {format(currentMonth, 'MMMM yyyy')}
          </div>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <CreateTaskDialog 
            buttonVariant="default"
            buttonSize="sm"
            onTaskCreated={handleTaskFormSubmit}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <div className="md:col-span-5">
          <Card>
            <CardContent className="p-2 md:p-4">
              <Calendar
                mode="single"
                month={currentMonth}
                selected={selectedDay}
                onSelect={handleDayClick}
                onMonthChange={setCurrentMonth}
                weekStartsOn={1}
                components={{
                  DayContent: (props) => {
                    const { date } = props;
                    // Don't spread props to avoid passing non-DOM props
                    return (
                      <div>
                        <div>{date.getDate()}</div>
                        {renderDayContents(date)}
                      </div>
                    );
                  }
                }}
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardContent className="p-4">
              {selectedDay ? (
                <div className="space-y-3">
                  <div className="font-medium">
                    Tasks for {format(selectedDay, 'MMMM d, yyyy')}
                  </div>
                  
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {selectedDayTasks.length > 0 ? (
                      selectedDayTasks.map(task => (
                        <div 
                          key={task.id}
                          className={`p-2 border rounded-md text-sm hover:bg-accent/50 cursor-pointer ${isTaskDueOnDay(task, selectedDay) ? 'border-primary' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium line-clamp-1">{task.title}</div>
                            <div className="flex items-center gap-1">
                              <div className={`h-2 w-2 rounded-full ${statusColor[task.status]}`} />
                              <div className={`h-2 w-2 rounded-full ${priorityToColor[task.priority]}`} />
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Status: {task.status.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </div>
                          {isTaskDueOnDay(task, selectedDay) && (
                            <div className="text-xs text-primary mt-1">
                              Due today
                            </div>
                          )}
                          <div className="flex justify-end mt-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <EditTaskDialog
                                      task={task as any}
                                      onTaskUpdated={onTaskUpdated as any}
                                      buttonVariant="ghost"
                                      buttonSize="sm"
                                      buttonIcon={true}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit Task</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        No tasks scheduled for this day
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    <CreateTaskDialog
                      buttonVariant="outline"
                      fullWidth={true}
                      onTaskCreated={(formData) => {
                        const updatedFormData = {
                          ...formData,
                          dueDate: formData.dueDate || selectedDay
                        };
                        handleTaskFormSubmit(updatedFormData);
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Select a day to view tasks
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Legend for colors */}
      <div className="flex flex-wrap gap-4 px-2">
        <div className="text-sm font-medium">Status colors:</div>
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${statusColor["todo"]}`}></div>
          <span className="text-xs">To Do</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${statusColor["in-progress"]}`}></div>
          <span className="text-xs">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${statusColor["done"]}`}></div>
          <span className="text-xs">Done</span>
        </div>
      </div>
    </div>
  )
} 