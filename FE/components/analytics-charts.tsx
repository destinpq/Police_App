"use client"

import { useState, useEffect } from "react"
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
import api from "@/lib/api"
import { toast } from "sonner"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

interface AnalyticsChartsProps {
  view?: "personal" | "team" | "organization"
  userId?: string
}

export function AnalyticsCharts({ view = "personal", userId }: AnalyticsChartsProps) {
  const [activeTab, setActiveTab] = useState("performance")
  const [chartType, setChartType] = useState("line")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Real data from backend
  const [weeklyActivity, setWeeklyActivity] = useState<any[]>([])
  const [teamPerformance, setTeamPerformance] = useState<any[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([])

  // Extract fetchAnalyticsData to be callable from multiple places
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {}
      const analyticsAPI = api?.analytics || {}
      
      // Define safe API getters
      const getWeeklyActivity = analyticsAPI.getWeeklyActivity || (() => Promise.resolve([]))
      const getTeamPerformance = analyticsAPI.getTeamPerformance || (() => Promise.resolve([]))
      const getMonthlyTrends = analyticsAPI.getMonthlyTrends || (() => Promise.resolve([]))
      
      // Fetch the data in parallel
      const [weeklyData, teamData, trendsData] = await Promise.all([
        getWeeklyActivity(params),
        getTeamPerformance(params),
        getMonthlyTrends(params),
      ])
      
      // Set state, ensuring all data is properly formatted as arrays
      setWeeklyActivity(Array.isArray(weeklyData) ? weeklyData : [])
      setTeamPerformance(Array.isArray(teamData) ? teamData : [])
      setMonthlyTrends(Array.isArray(trendsData) ? trendsData : [])

    } catch (err: any) {
      console.error("Error fetching analytics data:", err)
      const errorMessage = err.message || "Failed to load analytics data"
      setError(errorMessage)
      toast.error(errorMessage)
      
      // Reset data to empty arrays on error
      setWeeklyActivity([])
      setTeamPerformance([])
      setMonthlyTrends([])
    } finally {
      setLoading(false)
    }
  }

  // Initial data load on component mount or view change
  useEffect(() => {
    fetchAnalyticsData()
  }, [view, userId])

  // Add event listener for analytics refresh
  useEffect(() => {
    const handleAnalyticsRefresh = () => {
      console.log("AnalyticsCharts: Refresh event received, refetching data...")
      fetchAnalyticsData()
    }

    // Add event listener
    window.addEventListener('analytics:refresh', handleAnalyticsRefresh)
    
    // Clean up
    return () => {
      window.removeEventListener('analytics:refresh', handleAnalyticsRefresh)
    }
  }, [view, userId]) // Re-add when view changes

  // Empty state component for no data
  const EmptyState = ({ message = "No data available" }) => (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <div className="text-center text-muted-foreground">
        <p>{message}</p>
      </div>
    </div>
  )

  if (loading) {
    return <div className="flex justify-center py-10">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  }

  if (error) {
    return <div className="bg-destructive/10 text-destructive p-4 rounded-md">
      Error loading analytics data: {error}
    </div>
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
          {weeklyActivity.length === 0 ? (
            <EmptyState message="No task completion data available" />
          ) : (
            <Tabs defaultValue={chartType} onValueChange={setChartType} className="space-y-4">
              <TabsList>
                <TabsTrigger value="line">Line</TabsTrigger>
                <TabsTrigger value="area">Area</TabsTrigger>
                <TabsTrigger value="bar">Bar</TabsTrigger>
              </TabsList>
              <TabsContent value="line" className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={Array.isArray(weeklyActivity) ? weeklyActivity : []}
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
                    data={Array.isArray(weeklyActivity) ? weeklyActivity : []}
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
                    data={Array.isArray(weeklyActivity) ? weeklyActivity : []}
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
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {view === "personal"
              ? "Your Performance"
              : view === "team"
                ? "Team Member Performance"
                : "Department Performance"}
          </CardTitle>
          <CardDescription>
            {view === "personal"
              ? "Your task completion efficiency"
              : view === "team"
                ? "Task completion by team member"
                : "Task completion by department"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teamPerformance.length === 0 ? (
            <EmptyState message="No performance data available" />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Array.isArray(teamPerformance) ? teamPerformance : []}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tasks" fill="hsl(var(--primary))" />
                  <Bar dataKey="hours" fill="hsl(var(--secondary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
          <CardDescription>
            {view === "personal"
              ? "Your performance over time"
              : view === "team"
                ? "Team performance over time"
                : "Organization performance over time"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyTrends.length === 0 ? (
            <EmptyState message="No trend data available" />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={Array.isArray(monthlyTrends) ? monthlyTrends : []}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="tasks" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.8} />
                  <Area type="monotone" dataKey="efficiency" stackId="2" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.8} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

