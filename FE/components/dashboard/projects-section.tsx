"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { EditProjectDialog } from "@/components/edit-project-dialog"
import { MoreVertical, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Task, Project } from "@/lib/types"

interface ProjectsSectionProps {
  projects: Project[];
  tasks: Task[];
  onProjectDeleted: (projectId: string) => void;
  onProjectUpdated: (project: Project) => void;
}

export function ProjectsSection({
  projects,
  tasks,
  onProjectDeleted,
  onProjectUpdated
}: ProjectsSectionProps) {
  const router = useRouter();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {!Array.isArray(projects) || projects.length === 0 ? (
        <div className="md:col-span-2 lg:col-span-3 p-8 text-center text-muted-foreground border border-dashed rounded-md">
          No projects found. Create a new project to get started.
        </div>
      ) : (
        projects.map((project, i) => {
          if (!project) return null;
          
          // Calculate project stats
          const projectTasks = Array.isArray(tasks) 
            ? tasks.filter(task => {
                // Check both projectId and project.id
                if (task.projectId === project.id) return true;
                return !!task.project && task.project.id === project.id;
              })
            : [];
          const completedTasks = projectTasks.filter(task => task?.status === 'done').length;
          const progress = projectTasks.length ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
          
          return (
            <Card key={project.id || i} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle 
                    className="cursor-pointer hover:text-primary"
                    onClick={() => router.push(`/projects/${project.id}`)}
                  >
                    {project.name || 'Unnamed Project'}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <EditProjectDialog
                          project={project as any}
                          onProjectUpdated={onProjectUpdated as any}
                          buttonVariant="ghost"
                          buttonSize="sm"
                          buttonIcon={false}
                        />
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => project.id && onProjectDeleted(project.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>
                  {completedTasks} of {projectTasks.length} tasks completed
                </CardDescription>
              </CardHeader>
              <CardContent 
                className="cursor-pointer"
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <div className="space-y-2">
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <div>Progress</div>
                    <div>{progress}%</div>
                  </div>
                  <div className="pt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => router.push(`/projects/${project.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  );
} 