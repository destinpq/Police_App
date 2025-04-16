"use client"

import { Button } from "@/components/ui/button"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Task, Project } from "@/lib/types"

interface TasksSectionProps {
  tasks: Task[];
  projects: Project[];
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: string) => void;
}

export function TasksSection({
  tasks,
  projects,
  onTaskUpdated,
  onTaskDeleted
}: TasksSectionProps) {
  const router = useRouter();

  return (
    <div className="rounded-md border">
      <div className="grid grid-cols-6 border-b px-4 py-3 font-medium">
        <div className="col-span-2">Task</div>
        <div className="col-span-1">Project</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-1">Priority</div>
        <div className="col-span-1">Due Date</div>
      </div>

      {tasks.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">No tasks found. Create a new task to get started.</div>
      ) : (
        tasks.map((task, i) => (
          <div key={task.id || i} className="grid grid-cols-6 border-b px-4 py-3 last:border-0">
            <div className="col-span-2 font-medium">{task.title}</div>
            <div className="col-span-1 text-muted-foreground">
              {task.projectId ? (
                <span 
                  className="cursor-pointer hover:text-primary" 
                  onClick={() => router.push(`/projects/${task.projectId}`)}
                >
                  {projects.find(project => project.id === task.projectId)?.name || task.projectId}
                </span>
              ) : '-'}
            </div>
            <div className="col-span-1">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
            <div className="col-span-1">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
            <div className="col-span-1 flex items-center justify-between">
              <span className="text-muted-foreground">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}
              </span>
              <div className="flex items-center gap-1">
                <EditTaskDialog
                  task={task as any}
                  onTaskUpdated={onTaskUpdated as any}
                  buttonVariant="ghost"
                  buttonSize="icon"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive h-8 w-8"
                  onClick={() => task.id && onTaskDeleted(task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
} 