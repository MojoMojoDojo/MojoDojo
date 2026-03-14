import { motion } from 'motion/react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { useLanguage } from '../contexts/LanguageContext';

export function FAQPage() {

  const { t } = useLanguage();
  return (
    <div className="min-h-screen pt-20">
      <section className="py-20 bg-brand-charcoal">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 premium-heading">
              {t.faq.title} <span className="gold-accent">{t.faq.titleAccent}</span>
            </h1>
            <p className="text-xl text-brand-light-gray elegant-text">
              {t.faq.subtitle}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="premium-card p-8"
          >
            <Accordion type="single" collapsible className="space-y-4">
              {t.faq.items.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-brand-dark-gray rounded-lg px-6 bg-brand-charcoal"
                >
                  <AccordionTrigger className="text-left hover:text-brand-gold transition-colors">
                    <span className="font-semibold">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-brand-light-gray elegant-text pt-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <p className="text-brand-light-gray mb-4">{t.faq.stillHaveQuestions}</p>
            <a href="/contact" className="text-brand-gold hover:underline font-semibold">
              {t.faq.contactUsLink}
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
