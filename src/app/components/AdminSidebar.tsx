import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Warehouse, 
  DollarSign, 
  Users, 
  ClipboardList 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logoImage from '../../assets/MojoDojoLogo.png';

export function AdminSidebar() {
  const location = useLocation();
  const { user, hasRole } = useAuth();

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'admin', 'worker'] },
    { path: '/admin/dashboard/orders', label: 'Orders', icon: ShoppingCart, roles: ['owner', 'admin'] },
    { path: '/admin/dashboard/products', label: 'Products', icon: Package, roles: ['owner', 'admin'] },
    { path: '/admin/dashboard/inventory', label: 'Inventory', icon: Warehouse, roles: ['owner', 'admin'] },
    { path: '/admin/dashboard/financial', label: 'Financial', icon: DollarSign, roles: ['owner'] },
    { path: '/admin/dashboard/worker', label: 'Worker View', icon: ClipboardList, roles: ['owner', 'admin', 'worker'] },
    { path: '/admin/dashboard/users', label: 'User Management', icon: Users, roles: ['owner'] },
  ];

  const visibleNavItems = navItems.filter(item => 
    hasRole(item.roles as any)
  );

  return (
    <aside className="w-64 bg-brand-charcoal border-r border-brand-dark-gray flex-shrink-0">
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-brand-dark-gray">
          <img src={logoImage} alt="MojoDojo" className="h-10 w-10" />
          <span className="text-lg font-bold gold-accent">Admin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-brand-gold text-brand-black font-semibold'
                    : 'text-brand-light-gray hover:bg-brand-dark-gray hover:text-brand-gold'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="px-6 py-4 border-t border-brand-dark-gray">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-brand-black font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-brand-off-white truncate">{user?.name}</p>
              <p className="text-xs text-brand-light-gray capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
