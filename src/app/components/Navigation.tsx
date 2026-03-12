import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, X, ShoppingBag, User, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { LoginModal } from './LoginModal';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import logoImage from '../../assets/MojoDojoLogo.png';

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { path: '/', label: t.nav.home },
    { path: '/about', label: t.nav.about },
    { path: '/reviews', label: t.nav.reviews },
    { path: '/contact', label: t.nav.contact },
    { path: '/faq', label: t.nav.faq },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'glass-effect shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo - Left */}
            <Link to="/" className="flex items-center group" onClick={() => handleNavClick('/')}>
              <img
                src={logoImage}
                alt="MojoDojo Logo"
                className="h-12 w-12 transition-transform group-hover:scale-110"
              />
            </Link>

            {/* Desktop Navigation - Right */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'text-brand-gold'
                      : 'text-brand-off-white hover:text-brand-gold'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* EN / FR toggle */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
                className="text-xs font-bold px-2.5 py-1 rounded-full border border-brand-gold/50 text-brand-gold hover:bg-brand-gold hover:text-brand-black transition-all duration-200"
                title="Toggle language"
              >
                {language === 'en' ? 'FR' : 'EN'}
              </button>

              <Link to="/order">
                <Button className="btn-primary-gold gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  {t.nav.orderNow}
                </Button>
              </Link>

              {/* Profile/Login Button - no dropdown */}
              <button
                onClick={() => {
                  if (!user) {
                    setIsLoginModalOpen(true);
                  } else if (user.role === 'admin' || user.role === 'owner') {
                    navigate('/admin/dashboard');
                  } else {
                    handleSignOut();
                  }
                }}
                className="p-2 rounded-full border-2 border-brand-gold text-brand-gold 
                         hover:bg-brand-gold hover:text-black transition-all duration-300"
                title={user ? (user.role === 'admin' || user.role === 'owner' ? 'Admin Dashboard' : 'Sign Out') : 'Sign In'}
              >
                {user ? <LogOut className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-brand-off-white hover:text-brand-gold transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass-effect border-t border-brand-dark-gray"
            >
              <div className="px-4 py-6 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block py-2 text-base font-medium transition-colors ${
                      location.pathname === link.path
                        ? 'text-brand-gold'
                        : 'text-brand-off-white hover:text-brand-gold'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                <Link to="/order" className="block">
                  <Button className="btn-primary-gold gap-2 w-full">
                    <ShoppingBag className="w-4 h-4" />
                    {t.nav.orderNow}
                  </Button>
                </Link>

                {/* Mobile EN / FR toggle */}
                <button
                  onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
                  className="w-full py-2 text-sm font-bold border border-brand-gold/50 text-brand-gold rounded-lg hover:bg-brand-gold hover:text-brand-black transition-all"
                >
                  {language === 'en' ? 'Français' : 'English'}
                </button>

                {user ? (
                  <Button
                    onClick={() => {
                      if (user.role === 'admin' || user.role === 'owner') {
                        navigate('/admin/dashboard');
                      } else {
                        handleSignOut();
                      }
                    }}
                    variant="outline"
                    className="w-full btn-outline-gold gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    {user.role === 'admin' || user.role === 'owner' ? 'Admin Dashboard' : 'Sign Out'}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="w-full btn-outline-gold gap-2"
                  >
                    <User className="w-4 h-4" />
                    Sign In
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}