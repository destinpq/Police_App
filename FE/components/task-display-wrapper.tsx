"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskBoard } from "@/components/task-board"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskFilter } from "@/components/task-filter"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import { Task, TaskFormData } from "@/lib/types"
import { getAssigneeName } from "@/lib/task-adapter"
import type { TeamMember } from "@/contexts/team-context"
import { toast } from "sonner"
import { TaskApiResponse } from "@/lib/api-tasks"

// Define payload types locally if not shared
interface CreateTaskPayload {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: string;
  assigneeId?: string | null;
  projectId?: string | null;
  tags?: string | null;
  estimatedHours?: string | null;
}

interface UpdateTaskPayload {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'todo' | 'in-progress' | 'done';
  dueDate?: string | null;
  assigneeId?: string | null;
  projectId?: string | null;
  tags?: string | null;
  estimatedHours?: string | null;
}

interface TaskFilters {
  status?: Task['status'];
  priority?: Task['priority'];
  assignee?: string;
  project?: string;
  dateRange?: { from: Date; to: Date };
  view?: 'personal' | 'team' | 'organization';
}

interface TaskDisplayWrapperProps {
  initialTasks: Task[];
  initialTeamMembers: TeamMember[];
  initialError?: string;
}

export function TaskDisplayWrapper({
  initialTasks,
  initialTeamMembers,
  initialError
}: TaskDisplayWrapperProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(initialError || null);
  const [filters, setFilters] = useState<TaskFilters>({});

  useEffect(() => {
      if(initialError) {
          toast.error(`Initial data load failed: ${initialError}`);
      }
  }, [initialError]);

  // Function to refetch tasks based on current filters
  const fetchFilteredTasks = async (currentFilters = filters) => {
    setIsLoading(true);
    setError(null);
    console.log("[Client] Fetching filtered tasks with:", currentFilters);
    try {
      // Adapt your api.tasks.getAll or create a new filtered endpoint call
      // For now, just refetch all and filter client-side as an example
      const apiData = await api.tasks.getAll();
      let adaptedTasks = apiData.map(adaptApiToTask);

      // --- Client-side Filtering Example (Replace with API filtering) ---
      if (currentFilters.status) {
        adaptedTasks = adaptedTasks.filter(task => task.status === currentFilters.status);
      }
      if (currentFilters.priority) {
        adaptedTasks = adaptedTasks.filter(task => task.priority === currentFilters.priority);
      }
      if (currentFilters.assignee) {
         adaptedTasks = adaptedTasks.filter(task => task.assigneeId === currentFilters.assignee);
      }
       if (currentFilters.project) {
         adaptedTasks = adaptedTasks.filter(task => task.projectId === currentFilters.project);
      }
      // Add more filters as needed...
      // --- End Client-side Filtering Example ---

      setTasks(adaptedTasks);
    } catch (err: any) {
      console.error('[Client] Error fetching tasks:', err);
      const errorMessage = err.message || 'Failed to fetch tasks';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  const notifyAnalyticsOfChanges = async () => {
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('analytics:refresh'));
      }
    } catch (error) {
      console.error("Failed to notify analytics of changes:", error);
    }
  };

  // --- Task CRUD Handlers (Client-Side State + API) ---

  const handleTaskCreated = async (formValues: TaskFormData) => {
    setIsLoading(true);
    try {
      const taskDataForApi: CreateTaskPayload = {
        title: formValues.title,
        description: formValues.description,
        priority: formValues.priority,
        status: formValues.status,
        dueDate: formValues.dueDate ? formValues.dueDate.toISOString() : undefined,
        assigneeId: formValues.assignee || null,
        projectId: formValues.project || null,
        tags: Array.isArray(formValues.tags) ? formValues.tags.join(',') : (formValues.tags || undefined),
        estimatedHours: formValues.estimatedHours || undefined,
      };
      // Clean undefined before sending
      Object.keys(taskDataForApi).forEach((k) => taskDataForApi[k] === undefined && delete taskDataForApi[k]);


      const createdTaskFromApi = await api.tasks.create(taskDataForApi);
      const newTaskForState = adaptApiToTask(createdTaskFromApi);

      setTasks(prevTasks => [...prevTasks, newTaskForState]);
      setError(null);
      toast.success("Task created successfully!");
      await notifyAnalyticsOfChanges();
    } catch (err: any) {
      console.error('[Client] Error creating task:', err);
      const errorMessage = err.message || 'Failed to create task';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskBoardCreated = async (task: Task) => {
    // If TaskBoard creates via API, this just updates local state from callback
     console.log("[Client] Task created via TaskBoard component:", task);
     setTasks(prevTasks => [...prevTasks, adaptApiToTask(task)]);
     await notifyAnalyticsOfChanges();
  };

 const handleTaskUpdated = async (updatedTaskData: any) => {
    setIsLoading(true);
    const taskId = updatedTaskData.id;
    if (!taskId) {
        toast.error("Task ID missing for update.");
        setIsLoading(false);
        return;
    }

    try {
        const taskDataForApi: UpdateTaskPayload = {
            title: updatedTaskData.title,
            description: updatedTaskData.description,
            priority: updatedTaskData.priority,
            status: updatedTaskData.status,
            dueDate: updatedTaskData.dueDate
                      ? (updatedTaskData.dueDate instanceof Date
                          ? updatedTaskData.dueDate.toISOString()
                          : typeof updatedTaskData.dueDate === 'string' ? updatedTaskData.dueDate : undefined)
                      : (updatedTaskData.dueDate === null ? null : undefined),
            assigneeId: updatedTaskData.assigneeId ?? (updatedTaskData.assignee === null ? null : updatedTaskData.assignee?.id ?? undefined),
            projectId: updatedTaskData.projectId ?? (updatedTaskData.project === null ? null : updatedTaskData.project?.id ?? undefined),
            tags: updatedTaskData.tags ? (Array.isArray(updatedTaskData.tags) ? updatedTaskData.tags.join(',') : updatedTaskData.tags) : null,
            estimatedHours: updatedTaskData.estimatedHours ?? null,
        };

        const cleanedPayload = Object.entries(taskDataForApi).reduce((acc, [key, value]) => {
            if (value !== undefined) acc[key] = value;
            return acc;
        }, {} as { [key: string]: any });

        const updatedTaskFromApi = await api.tasks.update(taskId, cleanedPayload);
        const updatedTaskForState = adaptApiToTask(updatedTaskFromApi.task);

        setTasks(prevTasks =>
            prevTasks.map(t => t.id === updatedTaskForState.id ? updatedTaskForState : t)
        );
        toast.success("Task updated successfully!");
        await notifyAnalyticsOfChanges();
    } catch (err: any) {
        console.error('[Client] Error updating task:', err);
        toast.error(err.message || 'Failed to update task');
         // Optionally set error state: setError(err.message || 'Failed to update task');
    } finally {
        setIsLoading(false);
    }
};


  const handleTaskDeleted = async (taskId: string) => {
     if (!taskId) return;
     setIsLoading(true); // Indicate loading during delete
     try {
       const response = await api.tasks.delete(taskId);
       setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
       await notifyAnalyticsOfChanges();
       toast.success(response.message || "Task deleted successfully");
     } catch (err: any) {
       console.error('[Client] Error deleting task:', err);
       toast.error(err.message || "Failed to delete task");
       setError(err.message || "Failed to delete task"); // Show error
     } finally {
         setIsLoading(false);
     }
  };

  const handleFilterChange = (newFilters: TaskFilters) => {
    setFilters(newFilters);
    // Apply filters to tasks
    const filteredTasks = tasks.filter(task => {
      if (newFilters.status && task.status !== newFilters.status) return false;
      if (newFilters.priority && task.priority !== newFilters.priority) return false;
      if (newFilters.assignee && task.assigneeId !== newFilters.assignee) return false;
      if (newFilters.project && task.projectId !== newFilters.project) return false;
      // Add more filter conditions as needed
      return true;
    });
    setTasks(filteredTasks);
  };

  const adaptApiToTask = (apiTask: TaskApiResponse): Task => {
    return {
      id: apiTask.id,
      title: apiTask.title,
      description: apiTask.description,
      status: apiTask.status as Task['status'],
      priority: apiTask.priority as Task['priority'],
      assignee: apiTask.assignee,
      assigneeId: apiTask.assigneeId,
      project: apiTask.project,
      projectId: apiTask.projectId,
      dueDate: apiTask.dueDate,
      tags: apiTask.tags,
      estimatedHours: apiTask.estimatedHours,
      createdAt: apiTask.createdAt,
      updatedAt: apiTask.updatedAt
    };
  };

  const formatTaskForDisplay = (task: Task) => {
    return {
      ...task,
      statusDisplay: task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' '),
      priorityDisplay: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
      formattedDueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'
    };
  };

  // --- Render Logic ---
  if (error && tasks.length === 0) {
      return (
           <div className="text-red-500 p-4 border border-red-200 rounded bg-red-50">
              Error loading tasks: {error}
              <Button onClick={() => fetchFilteredTasks()} className="ml-4" variant="destructive" size="sm">Try Again</Button>
           </div>
      )
  }


  return (
    <>
      {/* Filter Component */}
      <TaskFilter onFilterChange={handleFilterChange} />

      {/* Loading Indicator */}
      {isLoading && (
         <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Error Display (if tasks exist but error occurred during update/delete) */}
      {error && !isLoading && (
          <div className="text-red-500 p-4 border border-red-200 rounded bg-red-50 mb-4">
              Operation failed: {error}
         </div>
      )}


      {/* Tabs for Board/List/Calendar */}
      {!isLoading && ( // Don't render tabs content while loading initial data might cause flicker
          <Tabs defaultValue="board">
              <div className="flex items-center justify-between">
                  <TabsList>
                      <TabsTrigger value="board">Board</TabsTrigger>
                      <TabsTrigger value="list">List</TabsTrigger>
                      <TabsTrigger value="calendar">Calendar</TabsTrigger>
                  </TabsList>
                   {/* Move Create Task Dialog trigger here */}
                   <CreateTaskDialog onTaskCreated={handleTaskCreated} />
              </div>

              {/* Board View */}
              <TabsContent value="board" className="mt-4">
                  <Card>
                      <CardHeader>
                          <CardTitle>Task Board</CardTitle>
                          <CardDescription>Manage your tasks using the Kanban board</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <TaskBoard
                              initialTasks={tasks}
                              // Pass handlers - TaskBoard likely calls API internally or these handlers
                              onTaskCreated={handleTaskBoardCreated} // Or directly call handleTaskCreated if dialog is inside
                              onTaskUpdated={handleTaskUpdated}
                              onTaskDeleted={handleTaskDeleted}
                          />
                      </CardContent>
                  </Card>
              </TabsContent>

              {/* List View */}
              <TabsContent value="list" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Task List</CardTitle>
                    <CardDescription>View all tasks in a list format</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 sm:p-6">
                    <div className="rounded-md border overflow-x-auto">
                      {/* Header Row */}
                      <div className="grid grid-cols-12 border-b px-4 py-3 font-medium">
                        <div className="col-span-6 sm:col-span-5 md:col-span-4">Task</div>
                        <div className="col-span-3 sm:col-span-2 text-center">Status</div>
                        <div className="col-span-3 sm:col-span-2 text-center hidden sm:block">Priority</div>
                        <div className="col-span-2 hidden md:block">Assignee</div>
                        <div className="col-span-2 hidden lg:block">Due Date</div>
                        <div className="col-span-3 sm:col-span-1 text-right sm:text-center">Actions</div>
                      </div>

                      {/* Task Rows */}
                      {tasks.length === 0 ? (
                        <div key="no-tasks" className="py-8 text-center text-muted-foreground">No tasks found for the current filter.</div>
                      ) : (
                        tasks.map((task, i) => {
                          const displayTask = formatTaskForDisplay(task); // Use adapter
                          return (
                            <div key={task.id || i} className="grid grid-cols-12 border-b px-4 py-3 last:border-0 items-center">
                              <div className="col-span-6 sm:col-span-5 md:col-span-4 font-medium truncate">{task.title}</div>
                              {/* Status */}
                              <div className="col-span-3 sm:col-span-2 text-center">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                    task.status === "todo" ? "bg-blue-100 text-blue-800" :
                                    task.status === "in-progress" ? "bg-amber-100 text-amber-800" :
                                    "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {displayTask.statusDisplay}
                                </span>
                              </div>
                              {/* Priority */}
                              <div className="col-span-3 sm:col-span-2 hidden sm:block text-center">
                                 <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                    task.priority === "high" ? "bg-rose-100 text-rose-800" :
                                    task.priority === "medium" ? "bg-amber-100 text-amber-800" :
                                    "bg-emerald-100 text-emerald-800"
                                  }`}
                                >
                                  {displayTask.priorityDisplay}
                                </span>
                              </div>
                              {/* Assignee */}
                              <div className="col-span-2 hidden md:block truncate">
                                {task.assignee && typeof task.assignee === 'object' 
                                  ? task.assignee.name 
                                  : getAssigneeName(task.assigneeId, teamMembers)}
                              </div>
                              {/* Due Date */}
                              <div className="col-span-2 hidden lg:block text-muted-foreground">
                                {displayTask.formattedDueDate}
                              </div>
                              {/* Actions */}
                              <div className="col-span-3 sm:col-span-1 flex items-center justify-end sm:justify-center gap-1">
                                <EditTaskDialog
                                  task={task} // Pass the full task object
                                  onTaskUpdated={handleTaskUpdated} // Let dialog trigger update
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive h-8 w-8"
                                  onClick={() => handleTaskDeleted(task.id)}
                                  disabled={isLoading} // Disable while loading
                                >
                                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                                    <path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4H3.5C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                  </svg>
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

               {/* Calendar View */}
              <TabsContent value="calendar" className="mt-4">
                 {/* Calendar implementation - Requires careful date handling */}
                 <Card>
                     <CardHeader>
                         <CardTitle>Task Calendar</CardTitle>
                         <CardDescription>View tasks on a calendar</CardDescription>
                     </CardHeader>
                     <CardContent>
                         {/* Placeholder for Calendar View - Requires a calendar library or custom implementation */}
                         <div className="text-center p-8 text-muted-foreground">Calendar view not implemented yet.</div>
                     </CardContent>
                 </Card>
              </TabsContent>
          </Tabs>
      )}
    </>
  );
}
