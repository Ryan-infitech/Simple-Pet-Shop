import { useState, useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import api from "@/services/api";

interface ApiStatusProps {
  className?: string;
}

const ApiStatus = ({ className }: ApiStatusProps) => {
  const [status, setStatus] = useState<"loading" | "connected" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("Checking connection...");
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        // Try to connect to the API status endpoint
        const response = await fetch(`${import.meta.env.VITE_API_URL}/health`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          setStatus("connected");
          setMessage("Backend connected");
        } else {
          setStatus("error");
          setMessage("Backend API returned an error");
        }
      } catch (error) {
        console.error("API connection error:", error);
        setStatus("error");
        setMessage("Cannot connect to backend API");
      }
    };

    checkApiStatus();

    // Set up a timer to periodically check the connection
    const interval = setInterval(checkApiStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={status === "connected" ? "outline" : "destructive"}
            className={`${className} cursor-help ${
              status === "loading" ? "animate-pulse" : ""
            }`}
          >
            {status === "connected" ? (
              <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 mr-1 text-red-500" />
            )}
            API {status === "connected" ? "Connected" : "Error"}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ApiStatus;
