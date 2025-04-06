import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardChart } from "@/components/dashboard-chart"
import { TaskSummary } from "@/components/task-summary"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Dashboard() {
  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <CreateTaskDialog buttonVariant="outline" />
          <CreateProjectDialog buttonVariant="outline" />
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <TaskSummary title="Total Tasks" value="24" description="All tasks" trend="+2 from last week" />
            <TaskSummary title="In Progress" value="8" description="Active tasks" trend="+1 from yesterday" />
            <TaskSummary title="Completed" value="12" description="This month" trend="+4 from last month" />
            <TaskSummary
              title="Overdue"
              value="4"
              description="Needs attention"
              trend="-2 from last week"
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
                  {[
                    { user: "Alice Johnson", action: "Completed Task #12", time: "1h ago" },
                    { user: "Bob Smith", action: "Created a new task", time: "2h ago" },
                    { user: "Charlie Davis", action: "Updated project timeline", time: "3h ago" },
                    { user: "Diana Miller", action: "Commented on Task #8", time: "4h ago" },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-full bg-muted"></div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{activity.user}</p>
                        <p className="text-sm text-muted-foreground">{activity.action}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">{activity.time}</div>
                    </div>
                  ))}
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

                {[
                  { name: "Complete API Documentation", type: "task", dueDate: "Tomorrow" },
                  { name: "Website Redesign", type: "project", dueDate: "In 3 days" },
                  { name: "Quarterly Report", type: "task", dueDate: "In 5 days" },
                  { name: "Client Presentation", type: "task", dueDate: "Next week" },
                ].map((item, i) => (
                  <div key={i} className="grid grid-cols-4 border-b px-4 py-3 last:border-0">
                    <div className="col-span-2 font-medium">{item.name}</div>
                    <div className="col-span-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.type === "task" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </span>
                    </div>
                    <div className="col-span-1 text-muted-foreground">{item.dueDate}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Website Redesign", tasks: 12, completed: 8, progress: 67 },
              { name: "Mobile App Development", tasks: 18, completed: 6, progress: 33 },
              { name: "Marketing Campaign", tasks: 8, completed: 2, progress: 25 },
              { name: "Product Launch", tasks: 15, completed: 0, progress: 0 },
              { name: "Customer Research", tasks: 6, completed: 6, progress: 100 },
              { name: "Infrastructure Update", tasks: 10, completed: 3, progress: 30 },
            ].map((project, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>
                    {project.completed} of {project.tasks} tasks completed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div>Progress</div>
                      <div>{project.progress}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6 mt-6">
          <div className="rounded-md border">
            <div className="grid grid-cols-6 border-b px-4 py-3 font-medium">
              <div className="col-span-2">Task</div>
              <div className="col-span-1">Project</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Priority</div>
              <div className="col-span-1">Due Date</div>
            </div>

            {[
              {
                name: "Design homepage mockup",
                project: "Website Redesign",
                status: "in-progress",
                priority: "high",
                dueDate: "May 15",
              },
              {
                name: "Implement authentication",
                project: "Mobile App",
                status: "todo",
                priority: "high",
                dueDate: "May 18",
              },
              {
                name: "Write API documentation",
                project: "Website Redesign",
                status: "todo",
                priority: "medium",
                dueDate: "May 20",
              },
              {
                name: "Create email templates",
                project: "Marketing Campaign",
                status: "in-progress",
                priority: "medium",
                dueDate: "May 22",
              },
              {
                name: "Test payment gateway",
                project: "Mobile App",
                status: "done",
                priority: "high",
                dueDate: "May 10",
              },
              {
                name: "Optimize database queries",
                project: "Website Redesign",
                status: "done",
                priority: "medium",
                dueDate: "May 8",
              },
            ].map((task, i) => (
              <div key={i} className="grid grid-cols-6 border-b px-4 py-3 last:border-0">
                <div className="col-span-2 font-medium">{task.name}</div>
                <div className="col-span-1 text-muted-foreground">{task.project}</div>
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
                <div className="col-span-1 text-muted-foreground">{task.dueDate}</div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

