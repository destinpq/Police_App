"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateTaskDialog } from "@/components/create-task-dialog"

interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high"
  assignee?: string
  dueDate?: string
  project?: string
  tags?: string[]
}

const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Research competitors",
    description: "Analyze top 5 competitors in the market",
    status: "todo",
    priority: "medium",
    assignee: "Alice Johnson",
    dueDate: "May 20, 2023",
    project: "Marketing Campaign",
    tags: ["research", "marketing"],
  },
  {
    id: "task-2",
    title: "Design new landing page",
    description: "Create wireframes for the new landing page",
    status: "todo",
    priority: "high",
    assignee: "Bob Smith",
    dueDate: "May 15, 2023",
    project: "Website Redesign",
    tags: ["design", "frontend"],
  },
  {
    id: "task-3",
    title: "Update documentation",
    description: "Update API documentation with new endpoints",
    status: "in-progress",
    priority: "medium",
    assignee: "Charlie Davis",
    dueDate: "May 18, 2023",
    project: "Mobile App",
    tags: ["documentation", "api"],
  },
  {
    id: "task-4",
    title: "Fix navigation bug",
    description: "Fix the navigation bug on mobile devices",
    status: "in-progress",
    priority: "high",
    assignee: "Diana Miller",
    dueDate: "May 12, 2023",
    project: "Website Redesign",
    tags: ["bug", "frontend"],
  },
  {
    id: "task-5",
    title: "Write blog post",
    description: "Write a blog post about our new features",
    status: "in-progress",
    priority: "low",
    assignee: "Alice Johnson",
    dueDate: "May 25, 2023",
    project: "Marketing Campaign",
    tags: ["content", "marketing"],
  },
  {
    id: "task-6",
    title: "Implement authentication",
    description: "Implement OAuth authentication",
    status: "done",
    priority: "high",
    assignee: "Bob Smith",
    dueDate: "May 5, 2023",
    project: "Mobile App",
    tags: ["security", "backend"],
  },
  {
    id: "task-7",
    title: "Create email templates",
    description: "Design and code email templates for marketing",
    status: "done",
    priority: "medium",
    assignee: "Charlie Davis",
    dueDate: "May 8, 2023",
    project: "Marketing Campaign",
    tags: ["email", "design"],
  },
  {
    id: "task-8",
    title: "Optimize database queries",
    description: "Improve performance of slow database queries",
    status: "done",
    priority: "high",
    assignee: "Diana Miller",
    dueDate: "May 10, 2023",
    project: "Mobile App",
    tags: ["performance", "database"],
  },
]

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

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const todoTasks = tasks.filter((task) => task.status === "todo")
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress")
  const doneTasks = tasks.filter((task) => task.status === "done")

  const handleTaskCreated = (taskData: any) => {
    const newTask: Task = {
      id: `task-${tasks.length + 1}`,
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
        {todoTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {todoTasks.length === 0 && (
          <div className="p-4 text-center text-muted-foreground border border-dashed rounded-md">No tasks to do</div>
        )}
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
        {inProgressTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {inProgressTasks.length === 0 && (
          <div className="p-4 text-center text-muted-foreground border border-dashed rounded-md">
            No tasks in progress
          </div>
        )}
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
        {doneTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {doneTasks.length === 0 && (
          <div className="p-4 text-center text-muted-foreground border border-dashed rounded-md">
            No completed tasks
          </div>
        )}
      </div>
    </div>
  )
}

function TaskCard({ task }: { task: Task }) {
  return (
    <Card className="shadow-sm hover:shadow transition-shadow">
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

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.map((tag, index) => (
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

