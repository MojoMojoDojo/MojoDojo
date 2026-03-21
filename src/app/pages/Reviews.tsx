import { useState, useEffect } from 'react';
import { Star, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabaseAnonKey, supabaseUrl } from '../../lib/supabase';
import { Button } from '../components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const HIDDEN_REVIEW_NAME = /^(amir|jad)\b/i;

// Fake reviews from Instagram comments
const FAKE_REVIEWS: Review[] = [
  {
    id: 'fake_1',
    name: 'giulia_garofano7',
    rating: 5,
    comment: 'Just got my order! Omg my guests, husband and I Truly Loved it!! Every bite was velvety and smooth to the palette. This one was with no alcohol. Highly recommended for its lightweight ingredients. Thank you so much!',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fake_2',
    name: 'v_toi',
    rating: 5,
    comment: 'I got these for a baby shower and it was perfect 👏',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fake_3',
    name: 'sissisabell',
    rating: 5,
    comment: 'My mouth is watering 🤤',
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fake_4',
    name: 'nikkiniknat',
    rating: 5,
    comment: 'Yum! 😋',
    created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fake_5',
    name: 'sarah_m',
    rating: 5,
    comment: 'Best desserts in Montreal! The Biscoff cheesecake is absolutely divine.',
    created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fake_6',
    name: 'michael_k',
    rating: 5,
    comment: 'Ordered for my anniversary and everyone loved the tiramisu tray. Will definitely order again!',
    created_at: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>(FAKE_REVIEWS);
  const [averageRating, setAverageRating] = useState(4.9);
  const [totalReviews, setTotalReviews] = useState(FAKE_REVIEWS.length);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t, language } = useLanguage();
  
  // Form state
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    loadReviews();
  }, []);

  const filterReviews = (items: Review[]) => items.filter(review => !HIDDEN_REVIEW_NAME.test(review.name.trim()));

  const loadReviews = async () => {
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/make-server-44229999/reviews`,
        {
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const allReviews = filterReviews([...FAKE_REVIEWS, ...(data.reviews || [])]);
        setReviews(allReviews);
        setTotalReviews(allReviews.length);
        
        // Recalculate average
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        setAverageRating(avgRating);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      // Keep fake reviews if API fails
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !comment.trim()) {
      alert(t.reviews.fillAllFields);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/make-server-44229999/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({ name, rating, comment }),
        }
      );

      if (response.ok) {
        // Reset form
        setName('');
        setRating(5);
        setComment('');
        setIsModalOpen(false);
        
        // Reload reviews
        await loadReviews();
        
        alert(t.reviews.thankYou);
      } else {
        const error = await response.json();
        alert(error.error || t.reviews.failedSubmit);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(t.reviews.failedSubmit);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return t.reviews.timeToday;
    if (diffInDays === 1) return t.reviews.timeYesterday;
    if (diffInDays < 7) return t.reviews.timeDaysAgo(diffInDays);
    if (diffInDays < 30) return t.reviews.timeWeeksAgo(Math.floor(diffInDays / 7));
    return date.toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-black pt-20 px-4 pb-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-2"
          >
            {t.reviews.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[#D4AF37] text-lg"
          >
            {t.reviews.subtitle}
          </motion.p>
        </div>

        {/* Average Rating Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-md mx-auto mb-16"
        >
          <div className="bg-zinc-900 border-2 border-zinc-800 rounded-lg p-8 text-center">
            <div className="flex justify-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 ${
                    star <= Math.round(averageRating)
                      ? 'fill-[#D4AF37] text-[#D4AF37]'
                      : 'text-zinc-700'
                  }`}
                />
              ))}
            </div>
            <div className="text-5xl font-bold text-[#D4AF37] mb-2">
              {averageRating.toFixed(1)}/5
            </div>
            <p className="text-gray-400">{t.reviews.fromReviews(totalReviews)}</p>
          </div>
        </motion.div>

        {/* Leave Review Button */}
        <div className="text-center mb-12">
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary-gold gap-2"
          >
            <Plus className="w-4 h-4" />
            {t.reviews.leaveReview}
          </Button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {loading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 h-48 animate-pulse"></div>
              ))}
            </>
          ) : reviews.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-400">
              {t.reviews.noReviews}
            </div>
          ) : (
            reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-all duration-300"
              >
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= review.rating
                          ? 'fill-[#D4AF37] text-[#D4AF37]'
                          : 'text-zinc-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-300 leading-relaxed mb-4 line-clamp-4">{review.comment}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{review.name}</span>
                  <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-zinc-900 border-2 border-zinc-800 rounded-lg p-6 max-w-md w-full relative"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-white mb-6">{t.reviews.modalTitle}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t.reviews.yourName}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 bg-black border-2 border-zinc-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                      placeholder={t.reviews.namePlaceholder}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t.reviews.ratingLabel}
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= (hoverRating || rating)
                                ? 'fill-[#D4AF37] text-[#D4AF37]'
                                : 'text-zinc-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t.reviews.yourReview}
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 bg-black border-2 border-zinc-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none transition-colors resize-none"
                      placeholder={t.reviews.reviewPlaceholder}
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-2 border-2 border-zinc-700 text-white rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      {t.reviews.cancel}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-[#D4AF37] text-black font-semibold py-2 px-4 rounded-lg hover:bg-[#B8941F] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? t.reviews.submitting : t.reviews.submit}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
