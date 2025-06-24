import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireRole?: "customer" | "admin";
  redirectTo?: string;
}

const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireRole,
  redirectTo = "/login",
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse space-y-4 text-center">
          <div className="h-8 w-8 bg-muted rounded-full mx-auto"></div>
          <div className="h-4 bg-muted rounded w-32"></div>
        </div>
      </div>
    );
  }

  // Redirect if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Redirect if specific role is required but user doesn't have it
  if (requireRole && user?.role !== requireRole) {
    if (user?.role === "admin" && requireRole === "customer") {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === "customer" && requireRole === "admin") {
      return <Navigate to="/customer" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
