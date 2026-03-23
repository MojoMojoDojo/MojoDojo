import type { UserRole } from '../../lib/supabase';

export type AdminSection =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'inventory'
  | 'financial'
  | 'worker'
  | 'users';

export const ADMIN_ONLY_ROLES: UserRole[] = ['admin'];
export const STAFF_ROLES: UserRole[] = ['admin', 'worker'];

export const ADMIN_SECTION_ROLES: Record<AdminSection, UserRole[]> = {
  dashboard: STAFF_ROLES,
  orders: STAFF_ROLES,
  products: ADMIN_ONLY_ROLES,
  inventory: ADMIN_ONLY_ROLES,
  financial: ADMIN_ONLY_ROLES,
  worker: STAFF_ROLES,
  users: ADMIN_ONLY_ROLES,
};

export function canAccessAdminSection(role: UserRole | undefined, section: AdminSection): boolean {
  if (!role) return false;
  return ADMIN_SECTION_ROLES[section].includes(role);
}

export function canManageSensitiveBusinessData(role: UserRole | undefined): boolean {
  return role === 'admin';
}

export function requiredRolesForAdminPath(pathname: string | null): UserRole[] {
  if (!pathname) return STAFF_ROLES;

  const normalized = pathname.toLowerCase();
  if (normalized.includes('/admin/dashboard/products')) return ADMIN_SECTION_ROLES.products;
  if (normalized.includes('/admin/dashboard/inventory')) return ADMIN_SECTION_ROLES.inventory;
  if (normalized.includes('/admin/dashboard/financial')) return ADMIN_SECTION_ROLES.financial;
  if (normalized.includes('/admin/dashboard/users')) return ADMIN_SECTION_ROLES.users;
  if (normalized.includes('/admin/dashboard/orders')) return ADMIN_SECTION_ROLES.orders;
  if (normalized.includes('/admin/dashboard/worker')) return ADMIN_SECTION_ROLES.worker;
  if (normalized.includes('/admin/dashboard')) return ADMIN_SECTION_ROLES.dashboard;

  return STAFF_ROLES;
}