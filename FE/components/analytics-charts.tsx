"use client"

import { useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Personal data
const personalData = {
  weekly: [
    { day: "Mon", tasks: 3, hours: 6 },
    { day: "Tue", tasks: 5, hours: 8 },
    { day: "Wed", tasks: 7, hours: 9 },
    { day: "Thu", tasks: 4, hours: 7 },
    { day: "Fri", tasks: 6, hours: 8 },
    { day: "Sat", tasks: 2, hours: 3 },
    { day: "Sun", tasks: 1, hours: 2 },
  ],
  category: [
    { name: "Development", value: 15 },
    { name: "Design", value: 10 },
    { name: "Marketing", value: 5 },
    { name: "Research", value: 8 },
    { name: "Other", value: 2 },
  ],
  monthly: [
    { month: "Jan", tasks: 15, hours: 60, efficiency: 80 },
    { month: "Feb", tasks: 18, hours: 65, efficiency: 82 },
    { month: "Mar", tasks: 16, hours: 62, efficiency: 81 },
    { month: "Apr", tasks: 22, hours: 70, efficiency: 85 },
    { month: "May", tasks: 20, hours: 68, efficiency: 84 },
    { month: "Jun", tasks: 25, hours: 75, efficiency: 88 },
  ],
}

// Team data
const teamData = {
  weekly: [
    { day: "Mon", tasks: 12, hours: 24 },
    { day: "Tue", tasks: 18, hours: 30 },
    { day: "Wed", tasks: 22, hours: 36 },
    { day: "Thu", tasks: 15, hours: 28 },
    { day: "Fri", tasks: 20, hours: 32 },
    { day: "Sat", tasks: 8, hours: 16 },
    { day: "Sun", tasks: 5, hours: 10 },
  ],
  category: [
    { name: "Development", value: 45 },
    { name: "Design", value: 30 },
    { name: "Marketing", value: 25 },
    { name: "Research", value: 20 },
    { name: "Other", value: 10 },
  ],
  members: [
    { name: "Alice", tasks: 24, hours: 40, efficiency: 92 },
    { name: "Bob", tasks: 18, hours: 35, efficiency: 85 },
    { name: "Charlie", tasks: 32, hours: 45, efficiency: 88 },
    { name: "Diana", tasks: 27, hours: 38, efficiency: 90 },
    { name: "Evan", tasks: 15, hours: 30, efficiency: 78 },
  ],
  monthly: [
    { month: "Jan", tasks: 45, hours: 160, efficiency: 82 },
    { month: "Feb", tasks: 52, hours: 170, efficiency: 84 },
    { month: "Mar", tasks: 48, hours: 165, efficiency: 83 },
    { month: "Apr", tasks: 61, hours: 180, efficiency: 87 },
    { month: "May", tasks: 58, hours: 175, efficiency: 86 },
    { month: "Jun", tasks: 65, hours: 185, efficiency: 89 },
  ],
}

// Organization data
const organizationData = {
  weekly: [
    { day: "Mon", tasks: 35, hours: 80 },
    { day: "Tue", tasks: 42, hours: 90 },
    { day: "Wed", tasks: 50, hours: 100 },
    { day: "Thu", tasks: 38, hours: 85 },
    { day: "Fri", tasks: 45, hours: 95 },
    { day: "Sat", tasks: 20, hours: 50 },
    { day: "Sun", tasks: 15, hours: 40 },
  ],
  category: [
    { name: "Development", value: 120 },
    { name: "Design", value: 80 },
    { name: "Marketing", value: 60 },
    { name: "Research", value: 40 },
    { name: "Other", value: 20 },
  ],
  departments: [
    { name: "Engineering", tasks: 150, hours: 300, efficiency: 88 },
    { name: "Design", tasks: 100, hours: 220, efficiency: 85 },
    { name: "Marketing", tasks: 80, hours: 180, efficiency: 82 },
    { name: "Product", tasks: 120, hours: 250, efficiency: 86 },
    { name: "Sales", tasks: 60, hours: 150, efficiency: 80 },
  ],
  monthly: [
    { month: "Jan", tasks: 280, hours: 600, efficiency: 81 },
    { month: "Feb", tasks: 310, hours: 650, efficiency: 83 },
    { month: "Mar", tasks: 290, hours: 620, efficiency: 82 },
    { month: "Apr", tasks: 350, hours: 700, efficiency: 86 },
    { month: "May", tasks: 330, hours: 680, efficiency: 85 },
    { month: "Jun", tasks: 380, hours: 750, efficiency: 88 },
  ],
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

interface AnalyticsChartsProps {
  view?: "personal" | "team" | "organization"
}

export function AnalyticsCharts({ view = "personal" }: AnalyticsChartsProps) {
  const [activeTab, setActiveTab] = useState("performance")
  const [chartType, setChartType] = useState("line")

  // Select the appropriate data based on the view
  const getWeeklyData = () => {
    switch (view) {
      case "personal":
        return personalData.weekly
      case "team":
        return teamData.weekly
      case "organization":
        return organizationData.weekly
      default:
        return personalData.weekly
    }
  }

  const getCategoryData = () => {
    switch (view) {
      case "personal":
        return personalData.category
      case "team":
        return teamData.category
      case "organization":
        return organizationData.category
      default:
        return personalData.category
    }
  }

  const getPerformanceData = () => {
    switch (view) {
      case "personal":
        return [
          {
            name: "You",
            tasks: personalData.weekly.reduce((sum, day) => sum + day.tasks, 0),
            hours: personalData.weekly.reduce((sum, day) => sum + day.hours, 0),
            efficiency: 85,
          },
        ]
      case "team":
        return teamData.members
      case "organization":
        return organizationData.departments
      default:
        return teamData.members
    }
  }

  const getTrendsData = () => {
    switch (view) {
      case "personal":
        return personalData.monthly
      case "team":
        return teamData.monthly
      case "organization":
        return organizationData.monthly
      default:
        return personalData.monthly
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Task Completion</CardTitle>
          <CardDescription>
            {view === "personal"
              ? "Your weekly task completion"
              : view === "team"
                ? "Team weekly task completion"
                : "Organization weekly task completion"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={chartType} onValueChange={setChartType} className="space-y-4">
            <TabsList>
              <TabsTrigger value="line">Line</TabsTrigger>
              <TabsTrigger value="area">Area</TabsTrigger>
              <TabsTrigger value="bar">Bar</TabsTrigger>
            </TabsList>
            <TabsContent value="line" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={getWeeklyData()}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">Day</span>
                                <span className="font-bold text-muted-foreground">{payload[0].payload.day}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">Tasks</span>
                                <span className="font-bold">{payload[0].value}</span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line type="monotone" dataKey="tasks" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="hours" stroke="hsl(var(--secondary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="area" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={getWeeklyData()}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="tasks"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="hsl(var(--secondary))"
                    fill="hsl(var(--secondary))"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="bar" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getWeeklyData()}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tasks" name="Tasks" fill="hsl(var(--primary))" />
                  <Bar dataKey="hours" name="Hours" fill="hsl(var(--secondary))" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task Distribution</CardTitle>
          <CardDescription>
            {view === "personal"
              ? "Your tasks by category"
              : view === "team"
                ? "Team tasks by category"
                : "Organization tasks by category"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getCategoryData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {getCategoryData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} tasks`, "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <Tabs defaultValue="performance" onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between">
              <CardTitle>
                {view === "personal" ? "Your Analytics" : view === "team" ? "Team Analytics" : "Organization Analytics"}
              </CardTitle>
              <TabsList>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
              </TabsList>
            </div>
            <CardDescription>
              {activeTab === "performance"
                ? view === "personal"
                  ? "Your task performance"
                  : view === "team"
                    ? "Tasks completed by team members"
                    : "Tasks completed by departments"
                : activeTab === "trends"
                  ? "Monthly performance trends"
                  : "Efficiency metrics"}
            </CardDescription>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === "performance" ? (
                <BarChart
                  data={getPerformanceData()}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tasks" name="Tasks Completed" fill="hsl(var(--primary))" />
                  <Bar dataKey="hours" name="Hours Worked" fill="hsl(var(--secondary))" />
                </BarChart>
              ) : activeTab === "trends" ? (
                <LineChart
                  data={getTrendsData()}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="tasks"
                    name="Tasks Completed"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    name="Hours Worked"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2}
                  />
                </LineChart>
              ) : (
                <BarChart
                  data={getPerformanceData()}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="efficiency" name="Efficiency (%)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

