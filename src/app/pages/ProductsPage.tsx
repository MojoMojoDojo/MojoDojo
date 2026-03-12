import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ShoppingBag, Info } from 'lucide-react';
import { api } from '../../lib/api';
import type { Product } from '../../lib/supabase';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/shared/ImageWithFallback';
import biscoffCheesecakeImage from '../../assets/BiscoffCheescake.png';
import brownieCheesecakeImage from '../../assets/BrownieCheescake.png';
import tiramisuTrayImage from '../../assets/TiramisuTray.png';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadProducts();
  }, []);

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

  const productImages: Record<string, string> = {
    prod_1: biscoffCheesecakeImage,
    prod_2: brownieCheesecakeImage,
    prod_3: tiramisuTrayImage,
  };

  const categories = ['all', 'cheesecake', 'tray', 'seasonal'];

  const filteredProducts = filter === 'all' 
    ? products 
    : products.filter(p => p.category === filter);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-24 bg-brand-charcoal" data-page-section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 premium-heading">
              Our <span className="gold-accent">Menu</span>
            </h1>
            <p className="text-xl text-brand-light-gray elegant-text">
              Premium desserts and trays, crafted fresh to order
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-brand-black sticky top-20 z-40 border-b border-brand-dark-gray" data-page-section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                  filter === category
                    ? 'bg-brand-gold text-brand-black'
                    : 'bg-brand-dark-gray text-brand-light-gray hover:bg-brand-gray hover:text-brand-gold'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20 bg-brand-charcoal" data-page-section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="shimmer-effect h-96 rounded-lg"></div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-brand-light-gray">
                No products available in this category yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="premium-card overflow-hidden group"
                >
                  <div className="relative h-64 overflow-hidden">
                    <ImageWithFallback
                      src={productImages[product.id] || ''}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className={`absolute top-4 right-4 status-badge ${
                      product.status === 'available' ? 'status-available' :
                      product.status === 'low_stock' ? 'status-pending' :
                      'status-sold-out'
                    }`}>
                      {product.status.replace('_', ' ')}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold mb-2">{product.name}</h3>
                    <p className="text-brand-light-gray mb-4 elegant-text line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-brand-light-gray">Serving Size:</span>
                        <span className="text-brand-off-white">{product.serving_size}</span>
                      </div>
                      {product.allergy_info && (
                        <div className="flex justify-between">
                          <span className="text-brand-light-gray">Allergens:</span>
                          <span className="text-brand-off-white text-xs">{product.allergy_info}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl font-bold gold-accent">${product.price}</span>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-brand-gold hover:text-brand-gold">
                            <Info className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-brand-charcoal border-brand-dark-gray text-brand-off-white">
                          <DialogHeader>
                            <DialogTitle className="text-2xl gold-accent">{product.name}</DialogTitle>
                            <DialogDescription className="text-brand-light-gray">
                              {product.description}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div>
                              <h4 className="font-semibold mb-2">Serving Size</h4>
                              <p className="text-brand-light-gray">{product.serving_size}</p>
                            </div>
                            {product.allergy_info && (
                              <div>
                                <h4 className="font-semibold mb-2">Allergy Information</h4>
                                <p className="text-brand-light-gray">{product.allergy_info}</p>
                              </div>
                            )}
                            <div>
                              <h4 className="font-semibold mb-2">Storage</h4>
                              <p className="text-brand-light-gray">
                                Keep refrigerated. Best enjoyed within 3-4 days.
                              </p>
                            </div>
                            <div className="pt-4">
                              <div className="text-3xl font-bold gold-accent mb-4">${product.price}</div>
                              <Link to="/order">
                                <Button className="w-full btn-primary-gold">
                                  Add to Order
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <Link to="/order">
                      <Button 
                        className="w-full btn-primary-gold"
                        disabled={product.status === 'sold_out'}
                      >
                        {product.status === 'sold_out' ? 'Sold Out' : (
                          <>
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            Add to Order
                          </>
                        )}
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-black" data-page-section>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 premium-heading">
            Ready to <span className="gold-accent">Order?</span>
          </h2>
          <p className="text-lg text-brand-light-gray mb-8 elegant-text">
            Place your order now for Montreal & Laval delivery or pickup
          </p>
          <Link to="/order">
            <Button size="lg" className="btn-primary-gold gap-2">
              <ShoppingBag className="w-5 h-5" />
              Place Your Order
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
