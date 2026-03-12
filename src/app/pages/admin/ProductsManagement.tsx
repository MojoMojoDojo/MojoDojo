import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../../lib/api';
import type { Product } from '../../../lib/supabase';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { Package } from 'lucide-react';

export function ProductsManagement() {
  const { accessToken } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const { products: data } = await api.products.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Products <span className="gold-accent">Management</span>
        </h1>
        <Button className="btn-primary-gold">
          Add New Product
        </Button>
      </div>

      <div className="premium-card p-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="shimmer-effect h-24 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="p-6 bg-brand-charcoal rounded-lg border border-brand-dark-gray">
                <div className="flex items-start justify-between mb-4">
                  <Package className="w-8 h-8 text-brand-gold" />
                  <div className={`status-badge ${
                    product.status === 'available' ? 'status-available' :
                    product.status === 'low_stock' ? 'status-pending' :
                    'status-sold-out'
                  }`}>
                    {product.status.replace('_', ' ')}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                <p className="text-sm text-brand-light-gray mb-4 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold gold-accent">${product.price}</span>
                  <Button size="sm" variant="outline" className="btn-outline-gold">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
