import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import logoImage from '../../assets/MojoDojoLogo.png';

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
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
            <Link to="/" className="flex items-center group" onClick={() => handleNavClick('/')}>
              <img
                src={logoImage}
                alt="MojoDojo Logo"
                className="h-12 w-12 transition-transform group-hover:scale-110"
              />
            </Link>

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
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-brand-off-white hover:text-brand-gold transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

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

                <button
                  onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
                  className="w-full py-2 text-sm font-bold border border-brand-gold/50 text-brand-gold rounded-lg hover:bg-brand-gold hover:text-brand-black transition-all"
                >
                  {language === 'en' ? 'Francais' : 'English'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
