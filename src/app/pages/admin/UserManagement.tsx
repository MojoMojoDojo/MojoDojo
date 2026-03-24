import { useEffect, useState, type FormEvent } from 'react';
import { Users, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../../lib/api';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

type ManagedUser = {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'worker';
  created_at?: string;
};

export function UserManagement() {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'worker' as 'admin' | 'worker',
  });

  useEffect(() => {
    loadUsers();
  }, [accessToken]);

  async function loadUsers() {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const { users: data } = await api.users.getAll(accessToken);
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      const message = error instanceof Error ? error.message : 'Failed to load users';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;

    const email = form.email.trim().toLowerCase();
    const password = form.password.trim();
    const name = form.name.trim();

    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }

    try {
      setSubmitting(true);
      await api.users.create(
        {
          email,
          password,
          name: name || undefined,
          role: form.role,
        },
        accessToken,
      );

      toast.success('User created successfully');
      setForm({ email: '', password: '', name: '', role: 'worker' });
      await loadUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
      const message = error instanceof Error ? error.message : 'Failed to create user';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(value?: string) {
    if (!value) return '—';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          User <span className="gold-accent">Management</span>
        </h1>
        <p className="text-brand-light-gray mt-2">Admin-only access • Manage team roles and permissions</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="premium-card p-6 xl:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-brand-gold" />
            <h2 className="text-xl font-semibold">Add Team Member</h2>
          </div>
          <form className="space-y-3" onSubmit={handleCreateUser}>
            <div>
              <label className="mb-1 block text-xs text-brand-light-gray">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="h-10 w-full rounded-lg border border-brand-dark-gray bg-brand-black px-3 text-sm text-brand-off-white focus:border-brand-gold focus:outline-none"
                placeholder="staff@mojodojo.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-brand-light-gray">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="h-10 w-full rounded-lg border border-brand-dark-gray bg-brand-black px-3 text-sm text-brand-off-white focus:border-brand-gold focus:outline-none"
                placeholder="Temporary password"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-brand-light-gray">Display Name (optional)</label>
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="h-10 w-full rounded-lg border border-brand-dark-gray bg-brand-black px-3 text-sm text-brand-off-white focus:border-brand-gold focus:outline-none"
                placeholder="Team member name"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-brand-light-gray">Role</label>
              <Select value={form.role} onValueChange={(value) => setForm((current) => ({ ...current, role: value as 'admin' | 'worker' }))}>
                <SelectTrigger className="h-10 w-full border-brand-dark-gray bg-brand-black text-brand-off-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-brand-dark-gray bg-brand-charcoal text-brand-off-white">
                  <SelectItem value="worker">Worker</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="h-10 w-full rounded-lg bg-brand-gold px-4 text-sm font-semibold text-brand-black transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Creating user...' : 'Add User'}
            </button>
          </form>

          <p className="mt-3 text-xs text-brand-light-gray">
            Creates the auth user and profile role in one step through the secured server function.
          </p>
        </div>

        <div className="premium-card p-6 xl:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-gold" />
            <h2 className="text-xl font-semibold">Team Members</h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="shimmer-effect h-16 rounded-lg" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="py-8 text-center text-brand-light-gray">No users found</p>
          ) : (
            <div className="space-y-3">
              {users.map((member) => (
                <div key={member.id} className="rounded-lg border border-brand-dark-gray bg-brand-charcoal p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-brand-off-white">{member.full_name || member.email}</p>
                      <p className="text-sm text-brand-light-gray">{member.email || 'No email on profile'}</p>
                      <p className="text-xs text-brand-light-gray mt-1">Created: {formatDate(member.created_at)}</p>
                    </div>
                    <span className={`status-badge ${member.role === 'admin' ? 'status-available' : 'status-pending'}`}>
                      {member.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
