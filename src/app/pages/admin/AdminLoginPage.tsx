import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Loader2, Lock } from 'lucide-react';
import logoImage from '../../../assets/MojoDojoLogo.png';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success('Welcome back!');
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid credentials');
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

          <div className="mt-6 p-4 bg-brand-charcoal rounded-lg border border-brand-dark-gray">
            <p className="text-xs text-brand-light-gray mb-2">
              <strong className="text-brand-gold">Demo Access:</strong>
            </p>
            <p className="text-xs text-brand-light-gray">
              To create an admin account, use the signup endpoint via the API or contact the system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
