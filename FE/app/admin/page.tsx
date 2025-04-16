"use client"

import { PageHeader } from "@/components/page-header"
import { ConnectionStatusDisplay } from "@/app/_components/connection-status"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Database, RefreshCw, Settings, Server } from "lucide-react"
import { useState } from "react"
import { API_BASE_URL } from "@/lib/api-core"
import { toast } from "sonner"

export default function AdminPage() {
  const [isFixingDb, setIsFixingDb] = useState(false);
  const [fixResults, setFixResults] = useState<string | null>(null);
  
  const runDatabaseFix = async () => {
    setIsFixingDb(true);
    setFixResults(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/database-fix/fix-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setFixResults(JSON.stringify(result, null, 2));
        toast.success("Database fix completed successfully");
      } else {
        const error = await response.text();
        setFixResults(`Error: ${response.status} - ${error}`);
        toast.error("Database fix failed");
      }
    } catch (error: any) {
      setFixResults(`Failed to run database fix: ${error.message}`);
      toast.error("Failed to connect to the server");
    } finally {
      setIsFixingDb(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        heading="Admin Panel"
        subheading="System management and diagnostics"
      />
      
      <div className="flex-1 p-8 pt-6 space-y-6">
        <Tabs defaultValue="status">
          <TabsList>
            <TabsTrigger value="status">System Status</TabsTrigger>
            <TabsTrigger value="database">Database Tools</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="status" className="space-y-6 pt-4">
            <div className="grid gap-6 md:grid-cols-2">
              <ConnectionStatusDisplay className="md:col-span-1" />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    System Information
                  </CardTitle>
                  <CardDescription>
                    Technical details about the application environment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Frontend:</p>
                      <p className="text-sm text-muted-foreground">Next.js</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Backend:</p>
                      <p className="text-sm text-muted-foreground">NestJS</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Database:</p>
                      <p className="text-sm text-muted-foreground">PostgreSQL</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">API Base URL:</p>
                      <p className="text-sm text-muted-foreground truncate">{API_BASE_URL}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Environment:</p>
                      <p className="text-sm text-muted-foreground">Development</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="database" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Maintenance
                </CardTitle>
                <CardDescription>
                  Tools to maintain and repair the database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-md p-4">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium">Fix Database Inconsistencies</p>
                      <p className="text-sm text-muted-foreground">
                        This tool will scan and fix null foreign key references, missing timestamps, and other data inconsistencies.
                        Only run this if you're experiencing database-related errors.
                      </p>
                      <div className="pt-2">
                        <Button 
                          variant="default" 
                          onClick={runDatabaseFix}
                          disabled={isFixingDb}
                        >
                          {isFixingDb ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Fixing Database...
                            </>
                          ) : (
                            "Run Database Fix"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {fixResults && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="text-xs font-medium mb-1">Results:</p>
                      <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-[200px]">
                        {fixResults}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced System Options</CardTitle>
                <CardDescription>
                  These options are for advanced users and administrators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Advanced system options will be added in a future update.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 