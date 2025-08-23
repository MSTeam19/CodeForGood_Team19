import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';

interface ProtectedRouteProps {
  requiredRole: string;
  children: React.ReactNode;
}

export function ProtectedRoute({ requiredRole, children }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (<div>Loading...</div>); 
  }

  if (!isAuthenticated || !user?.roles?.includes(requiredRole)) {
    console.log('Access denied.', user, 'Required role:', requiredRole, 'User roles:', user?.roles);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}