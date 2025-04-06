"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskBoard } from "@/components/task-board"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskFilter } from "@/components/task-filter"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { Button } from "@/components/ui/button"

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8888/api/tasks');
        
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        
        const data = await response.json();
        console.log('Fetched tasks:', data);
        setTasks(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Handle task creation
  const handleTaskCreated = (newTask) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  return (
    <div className="flex flex-col p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Tasks</h1>
        <CreateTaskDialog onTaskCreated={handleTaskCreated} />
      </div>

      <TaskFilter
        onFilterChange={(filters) => {
          console.log("Task filters changed:", filters)
          // In a real app, you would use these filters to fetch data
        }}
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 border border-red-200 rounded bg-red-50">
          Error loading tasks: {error}
        </div>
      ) : (
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
                <TaskBoard initialTasks={tasks} onTaskCreated={handleTaskCreated} />
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

                  {tasks.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">No tasks found</div>
                  ) : (
                    tasks.map((task, i) => (
                      <div key={task.id || i} className="grid grid-cols-12 border-b px-4 py-3 last:border-0 items-center">
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
                        <div className="col-span-2 hidden lg:block text-muted-foreground">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ""}
                        </div>
                        <div className="col-span-3 sm:col-span-1 flex items-center justify-end sm:justify-center gap-1">
                          <EditTaskDialog
                            task={task}
                            onTaskUpdated={(updatedTask) => {
                              console.log("Task updated:", updatedTask)
                              // Update task in state
                              setTasks(prevTasks => 
                                prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t)
                              );
                            }}
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive h-8 w-8"
                            onClick={() => {
                              // Delete task
                              fetch(`http://localhost:8888/api/tasks/${task.id}`, {
                                method: 'DELETE',
                              })
                              .then(() => {
                                // Remove from state
                                setTasks(prevTasks => prevTasks.filter(t => t.id !== task.id));
                              })
                              .catch(err => console.error('Error deleting task:', err));
                            }}
                          >
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
                    ))
                  )}
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
                      const day = (i % 31) + 1;
                      const isCurrentMonth = i < 31;
                      const currentDate = new Date();
                      const monthDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                      
                      // Find tasks due on this day
                      const dayTasks = tasks.filter(task => {
                        if (!task.dueDate) return false;
                        const taskDate = new Date(task.dueDate);
                        return taskDate.getDate() === day && 
                               taskDate.getMonth() === currentDate.getMonth() &&
                               taskDate.getFullYear() === currentDate.getFullYear();
                      });

                      return (
                        <div
                          key={i}
                          className={`min-h-[80px] md:min-h-[100px] border p-1 ${isCurrentMonth ? "bg-background" : "bg-muted/30"}`}
                        >
                          <div className="text-xs text-right mb-1">{day}</div>
                          {isCurrentMonth && dayTasks.map((task, idx) => (
                            <div 
                              key={idx} 
                              className={`text-xs p-1 mb-1 rounded truncate ${
                                task.priority === "high" 
                                  ? "bg-red-100 text-red-800" 
                                  : task.priority === "medium" 
                                    ? "bg-amber-100 text-amber-800" 
                                    : "bg-green-100 text-green-800"
                              }`}
                            >
                              {task.title}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

