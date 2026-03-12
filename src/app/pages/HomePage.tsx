import { Link } from 'react-router';
import { CheckCircle, Clock, ShoppingBag, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Product } from '../../lib/supabase';

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 premium-heading">
              Premium Desserts,
              <br />
              <span className="gold-accent">Crafted with Discipline</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-brand-light-gray mb-12 elegant-text max-w-3xl mx-auto">
              Experience handcrafted desserts and trays made with precision, premium ingredients, 
              and an unwavering commitment to quality. Montreal & Laval delivery.
            </p>
          </motion.div>
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
              Why <span className="gold-accent">MojoDojo</span>
            </h2>
            <p className="text-lg text-brand-light-gray elegant-text">
              Desserts made with discipline, precision, and care
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: CheckCircle,
                title: 'Premium Quality',
                description: 'Only the finest ingredients make it into our desserts. No compromises, no shortcuts.'
              },
              {
                icon: Clock,
                title: 'Freshly Made',
                description: 'Every order is prepared fresh, ensuring maximum flavor and quality in every bite.'
              },
              {
                icon: Star,
                title: 'Crafted with Care',
                description: 'Our team brings precision and passion to every dessert, treating each order like a masterpiece.'
              }
            ].map((item, index) => {
              const Icon = item.icon;
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
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-brand-light-gray elegant-text">{item.description}</p>
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
              How <span className="gold-accent">Ordering Works</span>
            </h2>
            <p className="text-lg text-brand-light-gray elegant-text">
              Simple, fast, and reliable
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Browse Menu', description: 'Explore our selection of premium desserts and trays' },
              { step: '02', title: 'Place Order', description: 'Choose your items and provide delivery details' },
              { step: '03', title: 'We Prepare', description: 'Our team crafts your order fresh to perfection' },
              { step: '04', title: 'Enjoy', description: 'Pickup or delivery — experience desserts done right' }
            ].map((item, index) => (
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
                Start Your Order
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
