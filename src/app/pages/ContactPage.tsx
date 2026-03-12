import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Instagram, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { useState } from 'react';

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      toast.success('Message sent! We\'ll get back to you soon.');
      setName('');
      setEmail('');
      setMessage('');
      setSubmitting(false);
    }, 1000);
  };

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
              Get in <span className="gold-accent">Touch</span>
            </h1>
            <p className="text-xl text-brand-light-gray elegant-text">
              Have questions? Want to place a custom order? We'd love to hear from you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="premium-card p-8"
            >
              <h2 className="text-2xl font-semibold mb-6 golden-line pl-4">Send Us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-black border-2 border-zinc-700 text-brand-off-white focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-black border-2 border-zinc-700 text-brand-off-white focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={6}
                    className="bg-black border-2 border-zinc-700 text-brand-off-white focus:border-[#D4AF37]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full btn-primary-gold gap-2"
                  disabled={submitting}
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="premium-card p-8">
                <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-gold-subtle flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-brand-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <a href="mailto:hello@mojodojo.com" className="text-brand-light-gray hover:text-brand-gold transition-colors">
                        hello@mojodojo.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-gold-subtle flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-brand-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Phone</h3>
                      <p className="text-brand-light-gray">Available for orders</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-gold-subtle flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-brand-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Service Area</h3>
                      <p className="text-brand-light-gray">Montreal & Laval, Quebec</p>
                      <p className="text-sm text-brand-light-gray mt-1">Delivery and pickup available</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-gold-subtle flex items-center justify-center flex-shrink-0">
                      <Instagram className="w-6 h-6 text-brand-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Social Media</h3>
                      <a
                        href="https://instagram.com/mojodojo"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-light-gray hover:text-brand-gold transition-colors"
                      >
                        @mojodojo
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="premium-card p-8 bg-brand-gold-subtle border-brand-gold">
                <h3 className="font-semibold mb-3 text-brand-gold">Business Hours</h3>
                <div className="space-y-2 text-sm text-brand-light-gray">
                  <p>Orders accepted daily</p>
                  <p>24-48 hours advance notice preferred</p>
                  <p>Same-day orders subject to availability</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}