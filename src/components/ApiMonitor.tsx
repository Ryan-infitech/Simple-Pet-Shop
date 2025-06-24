import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data for request log
type RequestLog = {
  id: string;
  url: string;
  method: string;
  status: number;
  time: number;
  timestamp: Date;
};

// Create a singleton class to track API requests
class RequestTracker {
  private static instance: RequestTracker;
  private logs: RequestLog[] = [];
  private listeners: (() => void)[] = [];

  private constructor() {
    // Override fetch to track requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = typeof args[0] === "string" ? args[0] : args[0].url;
      const method = args[1]?.method || "GET";

      try {
        const response = await originalFetch(...args);
        const time = performance.now() - startTime;

        // Only track API requests
        if (url.includes("/api/")) {
          this.addLog({
            id: Math.random().toString(36).substring(2),
            url,
            method,
            status: response.status,
            time,
            timestamp: new Date(),
          });
        }

        return response.clone();
      } catch (error) {
        const time = performance.now() - startTime;

        if (url.includes("/api/")) {
          this.addLog({
            id: Math.random().toString(36).substring(2),
            url,
            method,
            status: 0,
            time,
            timestamp: new Date(),
          });
        }

        throw error;
      }
    };
  }

  public static getInstance(): RequestTracker {
    if (!RequestTracker.instance) {
      RequestTracker.instance = new RequestTracker();
    }

    return RequestTracker.instance;
  }

  public getLogs(): RequestLog[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
    this.notifyListeners();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private addLog(log: RequestLog): void {
    this.logs.unshift(log);
    // Keep only the last 50 logs
    if (this.logs.length > 50) {
      this.logs.pop();
    }
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }
}

const ApiMonitor = () => {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const tracker = RequestTracker.getInstance();

    // Subscribe to changes
    const unsubscribe = tracker.subscribe(() => {
      setLogs(tracker.getLogs());
    });

    // Initial logs
    setLogs(tracker.getLogs());

    return unsubscribe;
  }, []);

  const clearLogs = () => {
    RequestTracker.getInstance().clearLogs();
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
        onClick={() => setIsVisible(true)}
      >
        Show API Monitor
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">API Request Monitor</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
            ✕
          </Button>
        </div>
        <CardDescription>Track API requests in real-time</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <ScrollArea className="h-64">
          {logs.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              No API requests yet
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2 text-xs border rounded-md flex items-start justify-between"
                >
                  <div className="space-y-1">
                    <div className="font-medium flex items-center">
                      <Badge variant="outline" className="mr-1">
                        {log.method}
                      </Badge>
                      <span className="truncate max-w-[180px] inline-block">
                        {log.url.replace(/^.*\/api\//, "/api/")}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      {log.timestamp.toLocaleTimeString()} •{" "}
                      {log.time.toFixed(0)}ms
                    </div>
                  </div>
                  <div>
                    {log.status >= 200 && log.status < 300 ? (
                      <Badge className="bg-green-500" variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" /> {log.status}
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />{" "}
                        {log.status || "Error"}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          variant="outline"
          size="sm"
          onClick={clearLogs}
          className="w-full"
        >
          Clear Logs
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApiMonitor;
