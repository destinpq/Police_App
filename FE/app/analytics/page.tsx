"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { AnalyticsFilter } from "@/components/analytics-filter"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { CreateTeamMemberDialog } from "@/components/create-team-member-dialog"
import { useState } from "react"

export default function AnalyticsPage() {
  const [currentView, setCurrentView] = useState<"personal" | "team" | "organization">("personal")

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <div className="flex gap-2">
          <CreateTaskDialog buttonVariant="outline" />
          <CreateProjectDialog buttonVariant="outline" />
          <CreateTeamMemberDialog buttonVariant="outline" />
        </div>
      </div>

      <AnalyticsFilter
        onFilterChange={(filters) => {
          console.log("Filters changed:", filters)
          // In a real app, you would use these filters to fetch data
        }}
        onViewChange={(view) => {
          setCurrentView(view)
        }}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentView === "personal" ? "27" : currentView === "team" ? "127" : "345"}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentView === "personal"
                ? "+3.2% from last month"
                : currentView === "team"
                  ? "+5.4% from last month"
                  : "+4.8% from last month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Completion Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentView === "personal" ? "2.5 days" : currentView === "team" ? "3.2 days" : "3.8 days"}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentView === "personal"
                ? "-0.3 days from last month"
                : currentView === "team"
                  ? "-0.5 days from last month"
                  : "-0.2 days from last month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {currentView === "personal"
                ? "Your Efficiency"
                : currentView === "team"
                  ? "Team Efficiency"
                  : "Organization Efficiency"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentView === "personal" ? "92%" : currentView === "team" ? "87%" : "84%"}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentView === "personal"
                ? "+3.5% from last month"
                : currentView === "team"
                  ? "+2.1% from last month"
                  : "+1.8% from last month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentView === "personal" ? "8%" : currentView === "team" ? "12%" : "15%"}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentView === "personal"
                ? "-2.1% from last month"
                : currentView === "team"
                  ? "-3.4% from last month"
                  : "-1.2% from last month"}
            </p>
          </CardContent>
        </Card>
      </div>

      <AnalyticsCharts view={currentView} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {currentView === "personal"
                ? "Your Productivity"
                : currentView === "team"
                  ? "Team Productivity"
                  : "Organization Productivity"}
            </CardTitle>
            <CardDescription>Task completion rate by day of week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day, i) => {
                const percentages = {
                  personal: [80, 85, 70, 95, 75],
                  team: [75, 82, 65, 90, 70],
                  organization: [72, 78, 68, 85, 73],
                }
                const percentage = percentages[currentView][i]

                return (
                  <div key={day} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{day}</div>
                      <div className="text-sm text-muted-foreground">{percentage}%</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentView === "personal"
                ? "Your Performance"
                : currentView === "team"
                  ? "Top Performers"
                  : "Top Departments"}
            </CardTitle>
            <CardDescription>
              {currentView === "personal"
                ? "Your task completion stats"
                : currentView === "team"
                  ? "Team members with highest task completion"
                  : "Departments with highest task completion"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentView === "personal" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Tasks Completed</div>
                    <div className="text-sm">27 / 30</div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: "90%" }} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Hours Logged</div>
                    <div className="text-sm">42 / 40</div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: "105%" }} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Efficiency Rating</div>
                    <div className="text-sm">92%</div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: "92%" }} />
                  </div>
                </div>
              ) : (
                [
                  { name: "Alice Johnson", tasks: 32, efficiency: 95 },
                  { name: "Bob Smith", tasks: 28, efficiency: 92 },
                  { name: "Charlie Davis", tasks: 24, efficiency: 88 },
                  { name: "Diana Miller", tasks: 22, efficiency: 85 },
                  { name: "Evan Wilson", tasks: 18, efficiency: 82 },
                ].map((member, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-muted"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{member.name}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>{member.tasks} tasks</span>
                        <span className="mx-2">•</span>
                        <span>{member.efficiency}% efficiency</span>
                      </div>
                    </div>
                    <div className="text-sm font-medium">#{i + 1}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {currentView === "personal"
              ? "Your Projects"
              : currentView === "team"
                ? "Team Projects"
                : "Organization Projects"}
          </CardTitle>
          <CardDescription>Current status of all active projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-7 border-b px-4 py-3 font-medium">
              <div className="col-span-2">Project</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Tasks</div>
              <div className="col-span-1">Completion</div>
              <div className="col-span-1">Due Date</div>
              <div className="col-span-1">Manager</div>
            </div>

            {[
              {
                name: "Website Redesign",
                status: "active",
                tasks: 24,
                completion: 65,
                dueDate: "Jun 15, 2023",
                manager: "Alice",
              },
              {
                name: "Mobile App",
                status: "active",
                tasks: 18,
                completion: 42,
                dueDate: "Jul 20, 2023",
                manager: "Bob",
              },
              {
                name: "Marketing Campaign",
                status: "on-hold",
                tasks: 12,
                completion: 30,
                dueDate: "Aug 5, 2023",
                manager: "Charlie",
              },
              {
                name: "Product Launch",
                status: "planning",
                tasks: 8,
                completion: 15,
                dueDate: "Sep 10, 2023",
                manager: "Diana",
              },
            ].map((project, i) => (
              <div key={i} className="grid grid-cols-7 border-b px-4 py-3 last:border-0">
                <div className="col-span-2 font-medium">{project.name}</div>
                <div className="col-span-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      project.status === "active"
                        ? "bg-green-100 text-green-800"
                        : project.status === "on-hold"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>
                <div className="col-span-1">{project.tasks}</div>
                <div className="col-span-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${project.completion}%` }} />
                    </div>
                    <span className="text-xs">{project.completion}%</span>
                  </div>
                </div>
                <div className="col-span-1 text-muted-foreground">{project.dueDate}</div>
                <div className="col-span-1">{project.manager}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

