"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { AnalyticsFilter } from "@/components/analytics-filter"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { CreateTeamMemberDialog } from "@/components/create-team-member-dialog"
import api from "@/lib/api"
import { toast } from "sonner"

export default function AnalyticsPage() {
  const [currentView, setCurrentView] = useState<"personal" | "team" | "organization">("personal")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Metrics
  const [taskCompletion, setTaskCompletion] = useState({ completed: 0, percentChange: "0.0" })
  const [timeMetrics, setTimeMetrics] = useState({ averageDays: "0.0", daysChange: "0.0" })
  const [efficiency, setEfficiency] = useState({ efficiency: 0, efficiencyChange: "0.0" })
  const [overdueRate, setOverdueRate] = useState({ overdueRate: 0, overdueChange: "0.0" })
  
  // Add event listener for analytics refresh
  useEffect(() => {
    const handleAnalyticsRefresh = () => {
      console.log("Analytics refresh event received, refetching data...");
      fetchMetrics();
    };

    // Add event listener
    window.addEventListener('analytics:refresh', handleAnalyticsRefresh);
    
    // Clean up
    return () => {
      window.removeEventListener('analytics:refresh', handleAnalyticsRefresh);
    };
  }, [currentView]); // Re-add when view changes

  // Extract fetchMetrics to be callable from multiple places
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the appropriate user ID based on view
      const userId = currentView === "personal" ? "1" : undefined;
      
      // Fetch all metrics in one call
      const dashboardData = await api.analytics.getDashboard(userId);
      
      if (dashboardData) {
        setTaskCompletion(dashboardData.taskCompletion || { completed: 0, percentChange: "0.0" });
        setTimeMetrics(dashboardData.timeMetrics || { averageDays: "0.0", daysChange: "0.0" });
        setEfficiency(dashboardData.efficiency || { efficiency: 0, efficiencyChange: "0.0" });
        setOverdueRate(dashboardData.overdue || { overdueRate: 0, overdueChange: "0.0" });
      }
    } catch (err: any) {
      console.error("Error fetching metrics:", err);
      setError(err?.message || "Failed to load metrics");
      toast.error("Failed to load metrics");
      
      // Reset metrics to defaults instead of using fallbacks
      setTaskCompletion({ completed: 0, percentChange: "0.0" });
      setTimeMetrics({ averageDays: "0.0", daysChange: "0.0" });
      setEfficiency({ efficiency: 0, efficiencyChange: "0.0" });
      setOverdueRate({ overdueRate: 0, overdueChange: "0.0" });
    } finally {
      setLoading(false);
    }
  };

  // Initial data load on component mount or view change
  useEffect(() => {
    fetchMetrics();
  }, [currentView]);

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
          // In a real app, you would use these filters to fetch filtered data
        }}
        onViewChange={(view) => {
          setCurrentView(view)
        }}
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          Error loading metrics: {error}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {taskCompletion.completed}
                </div>
                <p className="text-xs text-muted-foreground">
                  {taskCompletion.percentChange.startsWith('-') 
                    ? taskCompletion.percentChange 
                    : `+${taskCompletion.percentChange}`}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Completion Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {timeMetrics.averageDays} days
                </div>
                <p className="text-xs text-muted-foreground">
                  {timeMetrics.daysChange} days from last month
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
                  {efficiency.efficiency}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {efficiency.efficiencyChange.startsWith('-') 
                    ? efficiency.efficiencyChange 
                    : `+${efficiency.efficiencyChange}`}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Overdue Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overdueRate.overdueRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {overdueRate.overdueChange}% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <AnalyticsCharts view={currentView} />
        </>
      )}
    </div>
  )
}

