import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Instagram, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      toast.success(t.contact.messageSent);
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
              {t.contact.title} <span className="gold-accent">{t.contact.titleAccent}</span>
            </h1>
            <p className="text-xl text-brand-light-gray elegant-text">
              {t.contact.subtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="premium-card p-8"
            >
              <h2 className="text-2xl font-semibold mb-6 golden-line pl-4">{t.contact.formTitle}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">{t.contact.name}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-black border-2 border-zinc-700 text-brand-off-white focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <Label htmlFor="email">{t.contact.email}</Label>
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
                  <Label htmlFor="message">{t.contact.message}</Label>
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
                  {submitting ? t.contact.sending : t.contact.send}
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
                <h2 className="text-2xl font-semibold mb-6">{t.contact.infoTitle}</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-gold-subtle flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-brand-gold" />
                    </div>
                    <div>
                        <h3 className="font-semibold mb-1">{t.contact.email}</h3>
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
                      <h3 className="font-semibold mb-1">{t.contact.phone}</h3>
                      <p className="text-brand-light-gray">{t.contact.phoneAvailable}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-gold-subtle flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-brand-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{t.contact.serviceAreaLabel}</h3>
                      <p className="text-brand-light-gray">{t.contact.serviceAreaText}</p>
                      <p className="text-sm text-brand-light-gray mt-1">{t.contact.deliveryPickup}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-gold-subtle flex items-center justify-center flex-shrink-0">
                      <Instagram className="w-6 h-6 text-brand-gold" />
                    </div>
                    <div>
                        <h3 className="font-semibold mb-1">{t.contact.socialMedia}</h3>
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
                <h3 className="font-semibold mb-3 text-brand-gold">{t.contact.businessHoursTitle}</h3>
                <div className="space-y-2 text-sm text-brand-light-gray">
                  {t.contact.businessHoursLines.map((line, i) => <p key={i}>{line}</p>)}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}