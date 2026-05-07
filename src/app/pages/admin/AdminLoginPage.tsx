import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, type UserRole } from '../../../lib/supabase';
import { requiredRolesForAdminPath } from '../../lib/accessControl';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Loader2, Lock } from 'lucide-react';
import logoImage from '../../../assets/MojoDojoLogoNoBackground.png';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [devDebugMessage, setDevDebugMessage] = useState<string>('');
  const { signIn, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDev = import.meta.env.DEV;

  async function runDevAuthDebugCheck(targetPathname: string | null): Promise<string> {
    if (!isDev) return '';

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session?.user) {
      return 'Dev debug: no Supabase session.';
    }

    const { data: profileRow } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();

    if (!profileRow) {
      return 'Dev debug: no profile row.';
    }

    const role = profileRow.role as UserRole;
    const allowed = requiredRolesForAdminPath(targetPathname);
    if (!allowed.includes(role)) {
      return 'Dev debug: role not allowed.';
    }

    return '';
  }

  const redirectTarget = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const raw = params.get('redirect');
    if (!raw) return null;

    try {
      const decoded = decodeURIComponent(raw);
      if (!decoded.startsWith('/admin')) return null;
      return decoded;
    } catch {
      return null;
    }
  }, [location.search]);

  useEffect(() => {
    if (authLoading || !user) return;

    if (redirectTarget) {
      navigate(redirectTarget, { replace: true });
      return;
    }

    if (user.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
      return;
    }

    navigate('/admin/dashboard/orders', { replace: true });
  }, [authLoading, user, navigate, redirectTarget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDevDebugMessage('');

    try {
      const signedInUser = await signIn(email, password);
      toast.success('Welcome back!');

      if (redirectTarget) {
        navigate(redirectTarget);
        return;
      }

      if (signedInUser.role === 'admin') {
        navigate('/admin/dashboard');
        return;
      }

      navigate('/admin/dashboard/orders');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid credentials');

      const debugMessage = await runDevAuthDebugCheck(redirectTarget);
      if (debugMessage) {
        setDevDebugMessage(debugMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-black px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logoImage} alt="MojoDojo" className="h-20 w-20 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">
            <span className="gold-accent">Admin</span> Login
          </h1>
          <p className="text-brand-light-gray elegant-text">
            Secure access to MojoDojo operations
          </p>
        </div>

        <div className="premium-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-brand-charcoal border-brand-dark-gray text-brand-off-white"
                placeholder="admin@mojodojo.com"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-brand-charcoal border-brand-dark-gray text-brand-off-white"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              className="w-full btn-primary-gold gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {isDev && devDebugMessage ? (
            <p className="mt-3 text-xs text-yellow-400">{devDebugMessage}</p>
          ) : null}

          <div className="mt-6 p-4 bg-brand-charcoal rounded-lg border border-brand-dark-gray">
            <p className="text-xs text-brand-light-gray mb-2">
              <strong className="text-brand-gold">Admin Auth:</strong>
            </p>
            <p className="text-xs text-brand-light-gray">
              Accounts and roles are managed through Supabase Auth plus profiles role mapping.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
