"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { AnalyticsFilter } from "@/components/analytics-filter"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { CreateTeamMemberDialog } from "@/components/create-team-member-dialog"
import api, { analyticsApi } from "@/lib/api"
import { toast } from "sonner"

export default function AnalyticsPage() {
  // Remove authentication requirement
  const [currentView, setCurrentView] = useState<"personal" | "team" | "organization">("organization")
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
      
      const params = {}; // Add filter logic later
      const analyticsAPI = api?.analytics || analyticsApi;
      const getDashboard = analyticsAPI.getDashboard || (() => Promise.resolve(null));
      
      const dashboardData = await getDashboard(params);
      
      // Process data ONLY if it exists
      if (dashboardData) {
        setTaskCompletion(dashboardData.taskCompletion || { completed: 0, percentChange: "0.0" });
        setTimeMetrics(dashboardData.timeMetrics || { averageDays: "0.0", daysChange: "0.0" });
        setEfficiency(dashboardData.efficiency || { efficiency: 0, efficiencyChange: "0.0" });
        setOverdueRate(dashboardData.overdue || { overdueRate: 0, overdueChange: "0.0" });
      } else {
         // Set default empty/zero states if API returns null/undefined
        console.warn("Dashboard data was null or undefined.");
        setTaskCompletion({ completed: 0, percentChange: "0.0" });
        setTimeMetrics({ averageDays: "0.0", daysChange: "0.0" });
        setEfficiency({ efficiency: 0, efficiencyChange: "0.0" });
        setOverdueRate({ overdueRate: 0, overdueChange: "0.0" });
      }
    } catch (err: any) {
      console.error("Error fetching metrics:", err);
      const errorMessage = err.message || "Failed to load metrics";
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Do NOT set mock data here, let the error state handle the UI
      setTaskCompletion({ completed: 0, percentChange: "0.0" });
      setTimeMetrics({ averageDays: "0.0", daysChange: "0.0" });
      setEfficiency({ efficiency: 0, efficiencyChange: "0.0" });
      setOverdueRate({ overdueRate: 0, overdueChange: "0.0" });
    } finally {
      setLoading(false);
    }
  };

  // Initial data load on component mount
  useEffect(() => {
    console.log("Analytics page mounted, fetching metrics...");
    fetchMetrics();
    
    // Add analytics:refresh event listener when component mounts
    const handleAnalyticsRefresh = () => {
      console.log("Analytics page received refresh event, fetching metrics...");
      fetchMetrics();
    };
    
    window.addEventListener('analytics:refresh', handleAnalyticsRefresh);
    
    // Clean up listener on unmount
    return () => {
      window.removeEventListener('analytics:refresh', handleAnalyticsRefresh);
    };
  }, [currentView]); // Remove user dependency

  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        heading="Analytics"
        subheading="View insights and metrics about your team's performance"
      />
      
      <div className="flex-1 p-8 pt-6 space-y-6">
        <div className="flex items-center justify-end">
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
    </div>
  )
}

