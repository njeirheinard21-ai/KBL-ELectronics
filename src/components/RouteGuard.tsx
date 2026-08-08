import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export function RouteGuard({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const { user, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      navigate(`/auth?redirect=${location.pathname}`);
      return;
    }
    
    if (requireAdmin && !(user.role === 'admin' || user.role === 'super_admin' || user.role === 'staff')) {
      navigate('/');
    }
  }, [user, isLoading, navigate, location.pathname, requireAdmin]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
        <p className="text-fg-muted font-mono text-sm animate-pulse">Checking credentials...</p>
      </div>
    );
  }

  if (!user || (requireAdmin && !(user.role === 'admin' || user.role === 'super_admin' || user.role === 'staff'))) {
    return null;
  }

  return <>{children}</>;
}
