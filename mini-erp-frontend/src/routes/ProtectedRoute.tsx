import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  requiredPermission?: string;
}

export function ProtectedRoute({ requiredPermission }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && user && !user.permissions?.includes(requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
