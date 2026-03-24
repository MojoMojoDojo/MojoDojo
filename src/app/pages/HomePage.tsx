import { Link } from 'react-router';
import { ArrowRight, CheckCircle, ChevronDown, Clock, Instagram, ShoppingBag, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Product } from '../../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    loadProducts();
    initializeDatabase();
  }, []);

  async function initializeDatabase() {
    try {
      await api.initialize();
    } catch (error) {
      console.log('Database may already be initialized');
    }
  }

  async function loadProducts() {
    try {
      const { products: data } = await api.products.getAll();
      setProducts(data.filter(p => p.visible));
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" data-page-section>
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1586195831800-24f14c992cea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBkZXNzZXJ0JTIwbHV4dXJ5fGVufDF8fHx8MTc3MzIyMDk0Nnww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Premium Desserts"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-transparent to-brand-black"></div>
        </div>

        <motion.a
          href="https://www.instagram.com/mojomojo.dojo/"
          target="_blank"
          rel="noreferrer"
          initial={{ opacity: 0, y: 8 }}
          animate={{
            opacity: 1,
            x: [0, 6, -5, 4, 0],
            y: [0, -3, 4, -2, 0],
            boxShadow: [
              '0 0 0 rgba(59,130,246,0)',
              '0 0 12px rgba(59,130,246,0.18)',
              '0 0 0 rgba(59,130,246,0)',
            ],
          }}
          transition={{
            opacity: { duration: 0.55, delay: 0.45 },
            x: { duration: 7.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
            y: { duration: 6.2, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
            boxShadow: { duration: 3.2, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' },
          }}
          className="absolute z-20 left-20 sm:left-24 md:left-36 lg:left-48 top-28 sm:top-32 md:top-36
                     inline-flex items-center gap-1.5 rounded-full border border-blue-400/45 bg-black/55
                     px-2.5 py-1.5 text-[11px] sm:text-xs font-medium text-blue-100 backdrop-blur-md
                     transition-colors hover:text-white hover:border-blue-300/70"
          aria-label={t.home.hero.instagramAriaLabel}
        >
          <span className="text-blue-300/80">→</span>
          <Instagram className="w-3.5 h-3.5 text-blue-300" />
          <span>{t.home.hero.instagramCta}</span>
          <ArrowRight className="w-3 h-3 text-blue-300/90" />
        </motion.a>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 premium-heading">
              {t.home.hero.title}
              <br />
              <span className="gold-accent">{t.home.hero.subtitle}</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-brand-light-gray mb-12 elegant-text max-w-3xl mx-auto">
              {t.home.hero.description}
            </p>
          </motion.div>

          <motion.a
            href="#why-mojodojo"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-brand-gold/35 bg-black/25 text-brand-gold/80 backdrop-blur-sm transition-all duration-200 hover:scale-[1.04] hover:text-brand-gold hover:border-brand-gold/55"
            onClick={(event) => {
              event.preventDefault();
              document.getElementById('why-mojodojo')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });
            }}
            aria-label={t.home.hero.scrollAriaLabel}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.a>
        </div>

      </section>

      {/* Spacing Section */}

      {/* Why MojoDojo */}
      <section className="min-h-screen py-28 bg-black flex items-center" id="why-mojodojo" data-page-section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 premium-heading">
              {t.home.why.title} <span className="gold-accent">{t.home.why.titleAccent}</span>
            </h2>
            <p className="text-lg text-brand-light-gray elegant-text">
              {t.home.why.subtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.home.why.cards.map((card, index) => {
              const icons = [CheckCircle, Clock, Star];
              const Icon = icons[index];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="premium-card p-8 text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-gold-subtle mb-6">
                    <Icon className="w-8 h-8 text-brand-gold" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{card.title}</h3>
                  <p className="text-brand-light-gray elegant-text">{card.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="min-h-screen py-28 bg-brand-charcoal flex items-center" data-page-section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 premium-heading">
              {t.home.howItWorks.title} <span className="gold-accent">{t.home.howItWorks.titleAccent}</span>
            </h2>
            <p className="text-lg text-brand-light-gray elegant-text">
              {t.home.howItWorks.subtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {t.home.howItWorks.steps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="golden-line pl-6">
                  <div className="text-6xl font-bold gold-accent opacity-30 mb-4 
                                  transition-all duration-300 
                                  group-hover:opacity-100 group-hover:scale-110 
                                  group-hover:drop-shadow-[0_0_24px_rgba(244,196,48,0.9)]
                                  group-hover:text-shadow-gold">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 transition-colors duration-300 group-hover:text-brand-gold">{item.title}</h3>
                  <p className="text-brand-light-gray elegant-text">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/order">
              <Button size="lg" className="btn-primary-gold gap-2">
                <ShoppingBag className="w-5 h-5" />
                {t.home.howItWorks.cta}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
