import { Outlet, Navigate, useNavigate } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AdminSidebar } from '../components/AdminSidebar';
import { Button } from '../components/ui/button';
import { ChevronDown, LogOut, UserCircle2 } from 'lucide-react';
import logoImage from '../../assets/MojoDojoLogo.png';

export function AdminLayout() {
  const { user, loading, signOut, authIssue } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="animate-gold-pulse">
          <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin" replace />;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      setTimeout(() => navigate('/admin', { replace: true }), 100);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-brand-off-white flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <header className="h-16 glass-effect border-b border-brand-dark-gray flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="MojoDojo" className="h-10 w-10" />
            <div>
              <h1 className="text-lg font-semibold">MojoDojo Admin</h1>
              <p className="text-xs text-brand-light-gray">
                {user.name} | <span className="gold-accent capitalize">{user.role}</span>
              </p>
            </div>
          </div>

          <div className="relative" ref={profileMenuRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="text-brand-light-gray hover:text-brand-gold gap-2"
            >
              <UserCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">{user.name?.trim() || user.email}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </Button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-zinc-700 bg-zinc-900 shadow-lg p-2 z-30">
                <div className="px-2 py-2 border-b border-zinc-700">
                  <p className="text-sm font-medium text-white truncate">{user.name ?? user.email}</p>
                  <p className="text-xs text-zinc-400">Signed in as {user.role}</p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-2 w-full flex items-center gap-2 rounded-md px-2 py-2 text-sm text-brand-light-gray hover:text-brand-gold hover:bg-zinc-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {isDev && authIssue ? (
            <p className="mb-4 text-xs text-yellow-400">{authIssue}</p>
          ) : null}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
