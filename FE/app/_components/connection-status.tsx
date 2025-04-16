"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Database, Server, WifiOff, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { checkApiConnection, toggleMockDataMode } from "@/lib/api"
import { API_BASE_URL } from "@/lib/api-core"

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'partial' | 'mock';

export function ConnectionStatusDisplay({
  onRetry,
  className
}: {
  onRetry?: () => Promise<void>;
  className?: string;
}) {
  const [apiStatus, setApiStatus] = useState<ConnectionStatus>('connecting');
  const [dbStatus, setDbStatus] = useState<ConnectionStatus>('connecting');
  const [isChecking, setIsChecking] = useState(false);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [details, setDetails] = useState({
    api: { message: 'Checking connection...', error: null as string | null },
    database: { message: 'Checking connection...', error: null as string | null }
  });

  const checkConnections = async () => {
    setIsChecking(true);
    
    try {
      // Check API server
      setApiStatus('connecting');
      setDbStatus('connecting');
      
      try {
        const response = await fetch(`${API_BASE_URL}/ping`, {
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache' },
          signal: AbortSignal.timeout(3000)
        });
        
        if (response.ok) {
          setApiStatus('connected');
          setDetails(prev => ({
            ...prev,
            api: { message: 'API server is connected', error: null }
          }));
          
          // Now check database via health endpoint
          try {
            const healthResponse = await fetch(`${API_BASE_URL}/health`, {
              method: 'GET',
              headers: { 'Cache-Control': 'no-cache' },
              signal: AbortSignal.timeout(5000)
            });
            
            if (healthResponse.ok) {
              const healthData = await healthResponse.json();
              
              if (healthData.database?.status === 'connected') {
                setDbStatus('connected');
                setDetails(prev => ({
                  ...prev,
                  database: { message: 'Database is connected', error: null }
                }));
              } else {
                setDbStatus('disconnected');
                setDetails(prev => ({
                  ...prev,
                  database: { 
                    message: 'Database connection issue', 
                    error: healthData.database?.error || 'Unknown database error' 
                  }
                }));
              }
            } else {
              setDbStatus('disconnected');
              setDetails(prev => ({
                ...prev,
                database: { 
                  message: 'Health check failed', 
                  error: `Status: ${healthResponse.status}` 
                }
              }));
            }
          } catch (healthError: any) {
            setDbStatus('disconnected');
            setDetails(prev => ({
              ...prev,
              database: { 
                message: 'Database health check failed', 
                error: healthError.message 
              }
            }));
          }
        } else {
          setApiStatus('disconnected');
          setDbStatus('disconnected');
          setDetails(prev => ({
            ...prev,
            api: { 
              message: 'API server returned an error', 
              error: `Status: ${response.status}` 
            },
            database: {
              message: 'Database check skipped - API server unavailable',
              error: null
            }
          }));
        }
      } catch (error: any) {
        setApiStatus('disconnected');
        setDbStatus('disconnected');
        setDetails(prev => ({
          ...prev,
          api: { 
            message: 'Failed to connect to API server', 
            error: error.message
          },
          database: {
            message: 'Database check skipped - API server unavailable',
            error: null
          }
        }));
      }
      
      // Check if using mock data
      const mockEnabled = await checkApiConnection();
      setIsUsingMock(!mockEnabled);
      
    } finally {
      setIsChecking(false);
    }
  };

  const handleToggleMockMode = () => {
    const newMockState = toggleMockDataMode();
    setIsUsingMock(newMockState);
  };

  useEffect(() => {
    checkConnections();
  }, []);

  let status: ConnectionStatus = 'connecting';
  if (apiStatus === 'connected' && dbStatus === 'connected') {
    status = 'connected';
  } else if (apiStatus === 'disconnected' && dbStatus === 'disconnected') {
    status = 'disconnected';
  } else if (apiStatus === 'connected' && dbStatus === 'disconnected') {
    status = 'partial';
  }
  
  if (isUsingMock) {
    status = 'mock';
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === 'connected' && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          {status === 'disconnected' && (
            <WifiOff className="h-5 w-5 text-red-500" />
          )}
          {status === 'partial' && (
            <AlertCircle className="h-5 w-5 text-amber-500" />
          )}
          {status === 'connecting' && (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
          )}
          {status === 'mock' && (
            <Database className="h-5 w-5 text-blue-500" />
          )}
          Connection Status
        </CardTitle>
        <CardDescription>
          {status === 'connected' && "All systems are operational"}
          {status === 'disconnected' && "Connection issues detected"}
          {status === 'partial' && "API server is reachable, but database connection has issues"}
          {status === 'connecting' && "Checking connections..."}
          {status === 'mock' && "Using mock data mode - offline operation"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className={`h-4 w-4 ${apiStatus === 'connected' ? 'text-green-500' : 'text-gray-400'}`} />
            <span>API Server</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-sm">
                  {apiStatus === 'connected' && (
                    <span className="text-green-500">Connected</span>
                  )}
                  {apiStatus === 'disconnected' && (
                    <span className="text-red-500">Disconnected</span>
                  )}
                  {apiStatus === 'connecting' && (
                    <span className="text-gray-400">Checking...</span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{details.api.message}</p>
                {details.api.error && <p className="text-red-400 text-xs mt-1">{details.api.error}</p>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className={`h-4 w-4 ${dbStatus === 'connected' ? 'text-green-500' : 'text-gray-400'}`} />
            <span>Database</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-sm">
                  {dbStatus === 'connected' && (
                    <span className="text-green-500">Connected</span>
                  )}
                  {dbStatus === 'disconnected' && (
                    <span className="text-red-500">Disconnected</span>
                  )}
                  {dbStatus === 'connecting' && (
                    <span className="text-gray-400">Checking...</span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{details.database.message}</p>
                {details.database.error && <p className="text-red-400 text-xs mt-1">{details.database.error}</p>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkConnections}
          disabled={isChecking}
        >
          {isChecking ? "Checking..." : "Check Again"}
        </Button>
        
        <Button 
          variant={isUsingMock ? "destructive" : "outline"} 
          size="sm" 
          onClick={handleToggleMockMode}
        >
          {isUsingMock ? "Disable Mock Mode" : "Enable Mock Mode"}
        </Button>
      </CardFooter>
    </Card>
  );
} 