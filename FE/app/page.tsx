"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardChart } from "@/components/dashboard-chart"
import { TaskSummary } from "@/components/task-summary"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch tasks and projects in parallel
        const [tasksResponse, projectsResponse] = await Promise.all([
          fetch('http://localhost:8888/api/tasks'),
          fetch('http://localhost:8888/api/projects')
        ]);
        
        if (!tasksResponse.ok) {
          throw new Error('Failed to fetch tasks');
        }
        
        if (!projectsResponse.ok) {
          throw new Error('Failed to fetch projects');
        }
        
        const tasksData = await tasksResponse.json();
        const projectsData = await projectsResponse.json();
        
        console.log('Fetched tasks:', tasksData);
        console.log('Fetched projects:', projectsData);
        
        setTasks(tasksData);
        setProjects(projectsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate task statistics
  const getTotalTasks = () => tasks.length;
  const getInProgressTasks = () => tasks.filter(task => task.status === 'in-progress').length;
  const getCompletedTasks = () => tasks.filter(task => task.status === 'done').length;
  const getOverdueTasks = () => {
    const today = new Date();
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate < today && task.status !== 'done';
    }).length;
  };

  // Handle creating new items
  const handleTaskCreated = (newTask) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const handleProjectCreated = (newProject) => {
    setProjects(prevProjects => [...prevProjects, newProject]);
  };

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <CreateTaskDialog 
            buttonVariant="outline" 
            onTaskCreated={handleTaskCreated}
          />
          <CreateProjectDialog 
            buttonVariant="outline"
            onProjectCreated={handleProjectCreated}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 border border-red-200 rounded bg-red-50">
          Error loading data: {error}
        </div>
      ) : (
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <TaskSummary title="Total Tasks" value={getTotalTasks().toString()} description="All tasks" trend="" />
              <TaskSummary title="In Progress" value={getInProgressTasks().toString()} description="Active tasks" trend="" />
              <TaskSummary title="Completed" value={getCompletedTasks().toString()} description="All time" trend="" />
              <TaskSummary
                title="Overdue"
                value={getOverdueTasks().toString()}
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
                    {tasks.slice(0, 4).map((task, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-full bg-muted"></div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{task.assignee || 'Unassigned'}</p>
                          <p className="text-sm text-muted-foreground">
                            {task.status === 'done' ? 'Completed' : 'Working on'} {task.title}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                        </div>
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

                  {tasks
                    .filter(task => task.dueDate && task.status !== 'done')
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                    .slice(0, 4)
                    .map((task, i) => (
                      <div key={i} className="grid grid-cols-4 border-b px-4 py-3 last:border-0">
                        <div className="col-span-2 font-medium">{task.title}</div>
                        <div className="col-span-1">
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                            Task
                          </span>
                        </div>
                        <div className="col-span-1 text-muted-foreground">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.length === 0 ? (
                <div className="md:col-span-2 lg:col-span-3 p-8 text-center text-muted-foreground border border-dashed rounded-md">
                  No projects found. Create a new project to get started.
                </div>
              ) : (
                projects.map((project, i) => {
                  // Calculate project stats
                  const projectTasks = tasks.filter(task => task.project === `project${i+1}`);
                  const completedTasks = projectTasks.filter(task => task.status === 'done').length;
                  const progress = projectTasks.length ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
                  
                  return (
                    <Card key={project.id || i}>
                      <CardHeader className="pb-2">
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription>
                          {completedTasks} of {projectTasks.length} tasks completed
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <div>Progress</div>
                            <div>{progress}%</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
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

              {tasks.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">No tasks found. Create a new task to get started.</div>
              ) : (
                tasks.map((task, i) => (
                  <div key={task.id || i} className="grid grid-cols-6 border-b px-4 py-3 last:border-0">
                    <div className="col-span-2 font-medium">{task.title}</div>
                    <div className="col-span-1 text-muted-foreground">{task.project || '-'}</div>
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
                    <div className="col-span-1 text-muted-foreground">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

