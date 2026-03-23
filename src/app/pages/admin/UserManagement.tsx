import { Users } from 'lucide-react';

export function UserManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          User <span className="gold-accent">Management</span>
        </h1>
        <p className="text-brand-light-gray mt-2">Admin-only access • Manage team roles and permissions</p>
      </div>

      <div className="premium-card p-12 text-center">
        <Users className="w-16 h-16 text-brand-gold mx-auto mb-4 opacity-50" />
        <h2 className="text-2xl font-semibold mb-3">User Management</h2>
        <p className="text-brand-light-gray mb-6 max-w-2xl mx-auto">
          This section allows you to invite team members and assign roles (Admin, Worker). 
          manage permissions, and control access to different parts of the system.
        </p>
        <p className="text-sm text-brand-light-gray">
          Add users through your secured backend/admin process and update profile roles in Supabase.
        </p>
      </div>
    </div>
  );
}
