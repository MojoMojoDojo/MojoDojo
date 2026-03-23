import { Outlet, useLocation } from 'react-router';
import { useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { supabaseFunctionAnonKey, supabaseUrl } from '../../lib/supabase';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export function RootLayout() {
  useEffect(() => {
    if (import.meta.env.VITE_ENABLE_DEMO_INIT !== 'true') {
      return;
    }

    // Initialize database on app startup
    const initDatabase = async () => {
      try {
        const response = await fetch(
          `${supabaseUrl}/functions/v1/make-server-44229999/init`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseFunctionAnonKey}`,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log('Database initialization:', data.message);
        }
      } catch (error) {
        console.error('Database initialization error:', error);
      }
    };

    initDatabase();
  }, []);

  return (
    <div className="mojodojo-app min-h-screen flex flex-col">
      <ScrollToTop />
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}