"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskBoard } from "@/components/task-board"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskFilter } from "@/components/task-filter"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { Button } from "@/components/ui/button"

export default function TasksPage() {
  return (
    <div className="flex flex-col p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Tasks</h1>
        <CreateTaskDialog />
      </div>

      <TaskFilter
        onFilterChange={(filters) => {
          console.log("Task filters changed:", filters)
          // In a real app, you would use these filters to fetch data
        }}
      />

      <Tabs defaultValue="board">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="board" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Board</CardTitle>
              <CardDescription>Manage your tasks using the Kanban board</CardDescription>
            </CardHeader>
            <CardContent>
              <TaskBoard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Task List</CardTitle>
              <CardDescription>View all tasks in a list format</CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="rounded-md border overflow-x-auto">
                <div className="grid grid-cols-12 border-b px-4 py-3 font-medium">
                  <div className="col-span-6 sm:col-span-5 md:col-span-4">Task</div>
                  <div className="col-span-3 sm:col-span-2 text-center">Status</div>
                  <div className="col-span-3 sm:col-span-2 text-center hidden sm:block">Priority</div>
                  <div className="col-span-2 hidden md:block">Assignee</div>
                  <div className="col-span-2 hidden lg:block">Due Date</div>
                  <div className="col-span-3 sm:col-span-1 text-right sm:text-center">Actions</div>
                </div>

                {Array.from({ length: 8 }).map((_, i) => {
                  const task = {
                    id: `task-${i + 1}`,
                    title: `Task ${i + 1} Title`,
                    description: `Description for task ${i + 1}`,
                    status: i % 3 === 0 ? "todo" : i % 3 === 1 ? "in-progress" : "done",
                    priority: i % 3 === 0 ? "high" : i % 3 === 1 ? "medium" : "low",
                    assignee: `User ${(i % 4) + 1}`,
                    dueDate: `May ${10 + i}, 2023`,
                  } as const

                  return (
                    <div key={i} className="grid grid-cols-12 border-b px-4 py-3 last:border-0 items-center">
                      <div className="col-span-6 sm:col-span-5 md:col-span-4 font-medium truncate">{task.title}</div>
                      <div className="col-span-3 sm:col-span-2 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
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
                      <div className="col-span-3 sm:col-span-2 hidden sm:block text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
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
                      <div className="col-span-2 hidden md:block truncate">{task.assignee}</div>
                      <div className="col-span-2 hidden lg:block text-muted-foreground">{task.dueDate}</div>
                      <div className="col-span-3 sm:col-span-1 flex items-center justify-end sm:justify-center gap-1">
                        <EditTaskDialog
                          task={task}
                          onTaskUpdated={(updatedTask) => {
                            console.log("Task updated:", updatedTask)
                            // In a real app, you would update the task in your state/database
                          }}
                        />
                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                          >
                            <path
                              d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4H3.5C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z"
                              fill="currentColor"
                              fillRule="evenodd"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Calendar</CardTitle>
              <CardDescription>View tasks on a calendar</CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="border rounded-md p-2 sm:p-4 overflow-x-auto">
                <div className="grid grid-cols-7 gap-px min-w-[700px]">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center font-medium py-2">
                      {day}
                    </div>
                  ))}

                  {Array.from({ length: 35 }).map((_, i) => {
                    const day = (i % 31) + 1
                    const isCurrentMonth = i < 31

                    return (
                      <div
                        key={i}
                        className={`min-h-[80px] md:min-h-[100px] border p-1 ${isCurrentMonth ? "bg-background" : "bg-muted/30"}`}
                      >
                        <div className="text-xs text-right mb-1">{day}</div>
                        {isCurrentMonth && day % 5 === 0 && (
                          <div className="text-xs p-1 mb-1 rounded bg-blue-100 text-blue-800 truncate">Task {day}</div>
                        )}
                        {isCurrentMonth && day % 7 === 0 && (
                          <div className="text-xs p-1 rounded bg-green-100 text-green-800 truncate">Task {day + 1}</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

