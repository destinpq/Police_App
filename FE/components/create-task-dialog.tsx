"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Plus } from "lucide-react"
import { format } from "date-fns"
import { fetchFromApi, refreshAnalytics } from "@/lib/api-utils"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import api from "@/lib/api"
import { toast } from "sonner"
import { useTeam } from "@/contexts/team-context"
import { TaskFormData } from "@/lib/types"

const formSchema = z.object({
  title: z
    .string()
    .min(2, {
      message: "Title must be at least 2 characters.",
    })
    .max(50, {
      message: "Title must not exceed 50 characters.",
    }),
  description: z
    .string()
    .min(5, {
      message: "Description must be at least 5 characters.",
    })
    .max(500, {
      message: "Description must not exceed 500 characters.",
    }),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["todo", "in-progress", "done"]),
  dueDate: z.date().optional(),
  assignee: z.string().optional(),
  project: z.string().optional(),
  tags: z.string().optional(),
  estimatedHours: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CreateTaskDialogProps {
  onTaskCreated?: (task: FormValues) => void
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link"
  buttonSize?: "default" | "sm" | "lg" | "icon"
  fullWidth?: boolean
  projectId?: string
}

export function CreateTaskDialog({
  onTaskCreated,
  buttonVariant = "default",
  buttonSize = "default",
  fullWidth = false,
  projectId,
}: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { teamMembers } = useTeam()
  const [projects, setProjects] = useState<{id: string, name: string}[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      assignee: "",
      project: projectId || "",
      tags: "",
      estimatedHours: "",
    },
  })

  useEffect(() => {
    if (projectId && open) {
      form.setValue("project", projectId)
    }
  }, [projectId, open, form])

  useEffect(() => {
    if (open) {
      fetchProjects()
    }
  }, [open])

  const fetchProjects = async () => {
    try {
      // Add a console log for debugging
      console.log("Fetching projects...");
      
      // Instead of directly using api.projects.getAll, add more error handling
      let projectsData: {id: string, name: string}[] = [];
      try {
        projectsData = await api.projects.getAll();
      } catch (apiError) {
        console.error("API error fetching projects:", apiError);
        // If we got a 500 error, continue with empty data
        if (apiError instanceof Error && apiError.message.includes('500')) {
          console.warn("Server error fetching projects, continuing with empty data");
          // Don't show error toast for 500 errors to avoid overwhelming the user
          projectsData = [];
        } else {
          // For other errors, rethrow to be handled by the outer catch
          throw apiError;
        }
      }
      
      console.log("Projects data:", projectsData);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      
      // Show a more helpful error message
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
          toast.error("Could not connect to the server. Please check your connection.");
        } else {
          toast.error("Error loading projects. Please try again later.");
        }
      } else {
        toast.error("Failed to load projects");
      }
      
      // Set empty projects array to ensure the form still works
      setProjects([]);
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true);
      
      // Log the values being sent to the API
      console.log("Creating task with values:", values);
      
      // Create a clean task data object directly passing values to the task adapter
      const taskData: TaskFormData = {
        title: values.title,
        description: values.description || "",
        priority: values.priority,
        status: values.status,
        dueDate: values.dueDate,
        estimatedHours: values.estimatedHours?.toString() || undefined,
        tags: values.tags?.trim() || "",
        assignee: values.assignee,
        project: values.project
      };
      
      console.log("Sending task data to API:", taskData);
      
      // Send the data to the API directly
      let response;
      try {
        response = await api.tasks.create(taskData);
        console.log("Task created successfully:", response);
      } catch (apiError: any) {
        console.error("API error creating task:", apiError);
        
        // Handle specific error types
        if (apiError.message?.includes('Failed to fetch') || 
            apiError.message?.includes('Network')) {
          throw new Error("Could not connect to server. Please check your connection.");
        }
        
        if (apiError.message?.includes('500')) {
          throw new Error("Server error. Please try again later.");
        }
        
        if (apiError.message?.includes('400')) {
          throw new Error("Invalid task data. Please check all fields and try again.");
        }
        
        throw apiError;
      }
      
      // Create the new task object for local state/callbacks
      const newTask = {
        ...values,
        id: response?.id || `task-${Date.now()}`
      };
      
      console.log("Created task:", newTask);

      // Call the onTaskCreated callback if provided
      if (onTaskCreated) {
        onTaskCreated(newTask);
      }

      // Refresh analytics data
      refreshAnalytics();

      // Close the dialog and reset form
      setOpen(false);
      form.reset();
      toast.success("Task created successfully!");
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast.error(error.message || "Failed to create task. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={fullWidth ? "w-full" : ""}>
          <Plus className="mr-2 h-4 w-4" /> Create Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Fill in the details to create a new task. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the task in detail" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign to" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teamMembers.length > 0 ? (
                          teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-members" disabled>No team members found</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="project"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.length > 0 ? (
                          projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-projects" disabled>No projects found</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Hours</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 4" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Comma-separated tags"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Add comma-separated tags (e.g. "bug, frontend, urgent")</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Save Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

