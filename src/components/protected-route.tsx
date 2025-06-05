import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
}) => {
  const { currentUser, userProfile } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && userProfile?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
