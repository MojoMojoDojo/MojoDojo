import { Link } from 'react-router';
import { Home } from 'lucide-react';
import { Button } from '../components/ui/button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-black">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold gold-accent mb-4">404</h1>
        <h2 className="text-3xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-brand-light-gray mb-8 elegant-text">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button className="btn-primary-gold gap-2">
            <Home className="w-5 h-5" />
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
