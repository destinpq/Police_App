"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskSummary } from "@/components/task-summary"
import { DashboardChart } from "@/components/dashboard-chart"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { Task, User } from "@/lib/types"

interface OverviewSectionProps {
  tasks: Task[];
  totalTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  getInitials: (name: string) => string;
}

export function OverviewSection({
  tasks,
  totalTasks,
  inProgressTasks, 
  completedTasks,
  overdueTasks,
  getInitials
}: OverviewSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <TaskSummary title="Total Tasks" value={totalTasks.toString()} description="All tasks" trend="" />
        <TaskSummary title="In Progress" value={inProgressTasks.toString()} description="Active tasks" trend="" />
        <TaskSummary title="Completed" value={completedTasks.toString()} description="All time" trend="" />
        <TaskSummary
          title="Overdue"
          value={overdueTasks.toString()}
          description="Needs attention"
          trend=""
          trendDirection="down"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Task Completion</CardTitle>
            <CardDescription>Tasks completed over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Activity</CardTitle>
            <CardDescription>Recent activity from your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(tasks) && tasks.length > 0 ? 
                tasks.slice(0, 4).map((task, i) => {
                  const assignee = task?.assignee && typeof task.assignee === 'object' 
                    ? task.assignee 
                    : null;
                  
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <Avatar className="h-9 w-9">
                        {assignee && assignee.avatar ? (
                          <AvatarImage src={assignee.avatar} alt={assignee.name} />
                        ) : null}
                        <AvatarFallback>
                          {assignee ? getInitials(assignee.name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {assignee ? assignee.name : 'Unassigned'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {task?.status === 'done' ? 'Completed' : 'Working on'} {task?.title || 'Unknown Task'}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {task?.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                      </div>
                    </div>
                  )
                }) : 
                <div className="text-center py-4 text-muted-foreground">No recent activity</div>
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
          <CardDescription>Tasks and projects due soon</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-4 border-b px-4 py-3 font-medium">
              <div className="col-span-2">Item</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-1">Due Date</div>
            </div>

            {Array.isArray(tasks) && tasks.length > 0 ? 
              tasks
                .filter(task => task?.dueDate && task?.status !== 'done')
                .sort((a, b) => {
                  // Safe handling of dates with type checking
                  if (!a?.dueDate) return 1;
                  if (!b?.dueDate) return -1;
                  try {
                    const dateA = new Date(a.dueDate);
                    const dateB = new Date(b.dueDate);
                    return dateA.getTime() - dateB.getTime();
                  } catch (err) {
                    console.error("Error comparing dates:", err);
                    return 0;
                  }
                })
                .slice(0, 4)
                .map((task, i) => (
                  <div key={i} className="grid grid-cols-4 border-b px-4 py-3 last:border-0">
                    <div className="col-span-2 font-medium">{task?.title || 'Unknown Task'}</div>
                    <div className="col-span-1">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                        Task
                      </span>
                    </div>
                    <div className="col-span-1 text-muted-foreground">
                      {task?.dueDate ? 
                        (() => {
                          try {
                            return new Date(task.dueDate).toLocaleDateString()
                          } catch (err) {
                            return 'Invalid date'
                          }
                        })() 
                        : ''}
                    </div>
                  </div>
                )) 
              : 
              <div className="text-center py-4 text-muted-foreground">No upcoming deadlines</div>
            }
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 