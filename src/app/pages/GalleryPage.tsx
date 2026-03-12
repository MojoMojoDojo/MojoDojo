import { motion } from 'motion/react';
import { ImageWithFallback } from '../components/shared/ImageWithFallback';
import biscoffCheesecakeImage from '../../assets/BiscoffCheescake.png';
import brownieCheesecakeImage from '../../assets/BrownieCheescake.png';
import tiramisuTrayImage from '../../assets/TiramisuTray.png';

export function GalleryPage() {
  const galleryItems = [
    { id: 1, category: 'product', url: biscoffCheesecakeImage, caption: 'Biscoff Cheesecake' },
    { id: 2, category: 'product', url: brownieCheesecakeImage, caption: 'Brownie Cheesecake Tray' },
    { id: 3, category: 'product', url: tiramisuTrayImage, caption: 'Tiramisu Tray' },
    { id: 4, category: 'product', url: 'https://images.unsplash.com/photo-1586195831800-24f14c992cea?w=600', caption: 'Premium Desserts' },
  ];

  return (
    <div className="min-h-screen pt-20">
      <section className="py-20 bg-brand-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 premium-heading">
              Our <span className="gold-accent">Gallery</span>
            </h1>
            <p className="text-xl text-brand-light-gray elegant-text">
              A visual journey through our premium desserts and creations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="premium-card overflow-hidden group cursor-pointer"
              >
                <div className="relative aspect-square overflow-hidden">
                  <ImageWithFallback
                    src={item.url}
                    alt={item.caption}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-semibold">{item.caption}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
