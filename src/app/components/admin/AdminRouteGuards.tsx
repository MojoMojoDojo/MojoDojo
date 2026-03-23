import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../../lib/supabase';
import { STAFF_ROLES } from '../../lib/accessControl';

interface RequireAuthProps {
  allowedRoles?: UserRole[];
}

function encodeRedirectTarget(pathname: string, search: string): string {
  return encodeURIComponent(`${pathname}${search}`);
}

export function RequireAuth({ allowedRoles }: RequireAuthProps) {
  const { user, loading, hasRole, authIssue } = useAuth();
  const location = useLocation();
  const isDev = import.meta.env.DEV;

  if (isDev) {
    console.log('[admin-route] require-auth check', {
      route: `${location.pathname}${location.search}`,
      loading,
      userId: user?.id ?? null,
      role: user?.role ?? null,
      allowedRoles: allowedRoles ?? null,
      authIssue,
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="animate-gold-pulse text-center">
          <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
          {isDev && authIssue ? <p className="mt-4 text-xs text-yellow-400">{authIssue}</p> : null}
        </div>
      </div>
    );
  }

  if (!user) {
    const redirect = encodeRedirectTarget(location.pathname, location.search);
    if (isDev) {
      console.log('[admin-route] redirect decision', {
        reason: 'not authenticated',
        from: `${location.pathname}${location.search}`,
        to: `/admin?redirect=${redirect}`,
      });
    }
    return <Navigate to={`/admin?redirect=${redirect}`} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    if (isDev) {
      console.log('[admin-route] redirect decision', {
        reason: 'role not allowed',
        from: `${location.pathname}${location.search}`,
        to: '/admin/dashboard/worker',
      });
    }
    return <Navigate to="/admin/dashboard/worker" replace />;
  }

  if (isDev) {
    console.log('[admin-route] redirect decision', {
      reason: 'allowed',
      from: `${location.pathname}${location.search}`,
      to: 'outlet',
    });
  }

  return <Outlet />;
}

export function RequireAdmin() {
  return <RequireAuth allowedRoles={['admin']} />;
}

export function RequireStaff() {
  return <RequireAuth allowedRoles={STAFF_ROLES} />;
}

export function RedirectAuthenticatedAdminEntry() {
  const { user, loading, authIssue } = useAuth();
  const location = useLocation();
  const isDev = import.meta.env.DEV;
  const isAdminEntry = location.pathname === '/admin' || location.pathname === '/admin/';

  if (isDev) {
    console.log('[admin-route] entry check', {
      route: `${location.pathname}${location.search}`,
      isAdminEntry,
      loading,
      userId: user?.id ?? null,
      role: user?.role ?? null,
      authIssue,
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="animate-gold-pulse text-center">
          <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
          {isDev && authIssue ? <p className="mt-4 text-xs text-yellow-400">{authIssue}</p> : null}
        </div>
      </div>
    );
  }

  if (!user) {
    if (isDev) {
      console.log('[admin-route] redirect decision', {
        reason: 'guest user',
        from: `${location.pathname}${location.search}`,
        to: 'outlet',
      });
    }
    return <Outlet />;
  }

  if (!isAdminEntry) {
    if (isDev) {
      console.log('[admin-route] redirect decision', {
        reason: 'already on nested admin route',
        from: `${location.pathname}${location.search}`,
        to: 'outlet',
      });
    }
    return <Outlet />;
  }

  if (user.role === 'admin') {
    if (isDev) {
      console.log('[admin-route] redirect decision', {
        reason: 'authenticated admin at /admin',
        from: `${location.pathname}${location.search}`,
        to: '/admin/dashboard',
      });
    }
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (isDev) {
    console.log('[admin-route] redirect decision', {
      reason: 'authenticated worker at /admin',
      from: `${location.pathname}${location.search}`,
      to: '/admin/dashboard/worker',
    });
  }

  return <Navigate to="/admin/dashboard/worker" replace />;
}
