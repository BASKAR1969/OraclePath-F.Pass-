import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/domain';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallback?: string;
}

export default function ProtectedRoute({ children, allowedRoles, fallback = '/login' }: ProtectedRouteProps) {
  const { user, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="flex items-center gap-3 text-oracle-red">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect students to dashboard, instructors to their dashboard, etc.
    if (role === 'student') return <Navigate to="/dashboard" replace />;
    if (role === 'instructor') return <Navigate to="/instructor" replace />;
    if (role === 'manager') return <Navigate to="/dashboard" replace />;
    if (role === 'admin' || role === 'super_admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
