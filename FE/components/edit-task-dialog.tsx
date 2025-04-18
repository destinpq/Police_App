"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Pencil } from "lucide-react"
import { format } from "date-fns"
import { refreshAnalytics } from "@/lib/api-utils"

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
import { useTeam } from "@/contexts/team-context"
import api from "@/lib/api"
import { toast } from "sonner"

const formSchema = z.object({
  id: z.string(),
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
  estimatedHours?: string
}

interface Project {
  id: string;
  name: string;
}

interface EditTaskDialogProps {
  task: Task
  onTaskUpdated?: (task: FormValues) => void
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link"
  buttonSize?: "default" | "sm" | "lg" | "icon"
  buttonIcon?: boolean
}

export function EditTaskDialog({
  task,
  onTaskUpdated,
  buttonVariant = "ghost",
  buttonSize = "icon",
  buttonIcon = true,
}: EditTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const { teamMembers } = useTeam()
  
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Parse the dueDate string to a Date object if it exists
  const parseDueDate = () => {
    if (!task.dueDate) return undefined

    try {
      return new Date(task.dueDate)
    } catch (e) {
      return undefined
    }
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: parseDueDate(),
      assignee: typeof task.assignee === 'object' && task.assignee ? (task.assignee as any).id : task.assignee,
      project: typeof task.project === 'object' && task.project ? (task.project as any).id : task.project,
      tags: task.tags 
        ? Array.isArray(task.tags) 
          ? task.tags.join(", ") 
          : typeof task.tags === 'string' 
            ? task.tags 
            : ""
        : "",
      estimatedHours: task.estimatedHours,
    },
  })

  // Fetch projects when dialog opens
  useEffect(() => {
    if (open) {
      fetchProjects();
    }
  }, [open]);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const projectsData = await api.projects.getAll();
      setProjects(projectsData);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoadingProjects(false);
    }
  };

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true)
      
      // Format the data for the API to ensure proper handling of dates and empty fields
      const formattedValues = {
        ...values,
        // Handle date formatting - convert Date object to ISO string for API
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
        // Handle empty strings for optional fields by converting them to undefined
        project: values.project === "" ? undefined : values.project,
        assignee: values.assignee === "" ? undefined : values.assignee,
        tags: values.tags === "" ? undefined : values.tags,
        estimatedHours: values.estimatedHours === "" ? undefined : values.estimatedHours
      }
      
      console.log("Submitting task update with data:", formattedValues)
      
      // We need to remove undefined values since they cause issues with JSON.stringify
      const cleanedValues = Object.fromEntries(
        Object.entries(formattedValues).filter(([_, v]) => v !== undefined)
      );
      
      console.log("Cleaned values for submission:", cleanedValues)
      
      // Send updated task data to API
      const response = await api.tasks.update(values.id, cleanedValues)
      
      console.log("Task update response:", response)

      // Call the onTaskUpdated callback if provided
      if (onTaskUpdated) {
        onTaskUpdated(values)
      }
      
      // Refresh analytics data
      refreshAnalytics()

      setOpen(false)
      toast.success("Task updated successfully!")
    } catch (error) {
      console.error("Error updating task:", error)
      // Show more detailed error message if available
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      toast.error(`Failed to update task: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {buttonIcon ? (
          <Button variant={buttonVariant} size={buttonSize}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit task</span>
          </Button>
        ) : (
          <Button variant={buttonVariant} size={buttonSize}>
            <Pencil className="mr-2 h-4 w-4" /> Edit Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Update the task details. Click save when you're done.</DialogDescription>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingProjects ? "Loading projects..." : "Select project"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.length > 0 ? (
                          projects.map((project) => (
                            <SelectItem key={project.id} value={project.id || "undefined-project"}>
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
                      <Input type="number" placeholder="Hours to complete" {...field} value={field.value || ""} />
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
                    <Input placeholder="Comma-separated tags (e.g., frontend, bug, feature)" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>Separate tags with commas</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                className="mr-auto" 
                onClick={async () => {
                  try {
                    setIsSubmitting(true);
                    // Simple fetch check
                    try {
                      const response = await fetch('/api/health');
                      if (response.ok) {
                        const data = await response.json();
                        toast.success(`API connection successful: ${data.message || 'Backend is online'}`);
                        console.log('Health check result:', data);
                      } else {
                        toast.error('API connection failed');
                        console.error('Health check failed:', response.statusText);
                      }
                    } catch (err) {
                      toast.error('Could not connect to API');
                      console.error('Health check network error:', err);
                    }
                  } catch (error) {
                    toast.error('Could not perform API connectivity check');
                    console.error('Health check outer error:', error);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
              >
                Test API Connection
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

