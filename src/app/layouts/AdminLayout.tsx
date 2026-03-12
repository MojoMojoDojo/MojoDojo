import { Outlet, Navigate, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { AdminSidebar } from '../components/AdminSidebar';
import { Button } from '../components/ui/button';
import { LogOut } from 'lucide-react';
import logoImage from '../../assets/MojoDojoLogo.png';

export function AdminLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

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
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-brand-black text-brand-off-white flex">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Admin Header */}
        <header className="h-16 glass-effect border-b border-brand-dark-gray flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="MojoDojo" className="h-10 w-10" />
            <div>
              <h1 className="text-lg font-semibold">MojoDojo Admin</h1>
              <p className="text-xs text-brand-light-gray">
                {user.name} • <span className="gold-accent capitalize">{user.role}</span>
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-brand-light-gray hover:text-brand-gold"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
