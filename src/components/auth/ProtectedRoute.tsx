"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "partner";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { state: { from: location }, replace: true });
    }
    // Role-based redirect
    if (!isLoading && isAuthenticated && requiredRole && user?.role !== requiredRole) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location, requiredRole, user]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-credaly-bg flex items-center justify-center flex-col gap-4">
        <Loader2 className="animate-spin" size={32} color="#F5A623" />
        <p className="text-credaly-muted/50 text-sm">
          Authenticating session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
