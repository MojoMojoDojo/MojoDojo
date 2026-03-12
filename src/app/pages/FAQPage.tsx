import { motion } from 'motion/react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';

export function FAQPage() {
  const faqs = [
    {
      question: 'How do I place an order?',
      answer: 'You can place an order through our website by visiting the Order page, selecting your desired items, and filling out the order form. We\'ll confirm your order via email or phone.'
    },
    {
      question: 'Do you offer delivery or pickup?',
      answer: 'We offer both delivery and pickup options. Delivery is available in Montreal and Laval. Pickup details will be provided upon order confirmation.'
    },
    {
      question: 'How far in advance should I order?',
      answer: 'We recommend ordering 24-48 hours in advance to ensure availability. Same-day orders may be accommodated based on current capacity, but please contact us to confirm.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept both cash on delivery and online payment. You can select your preferred payment method when placing your order.'
    },
    {
      question: 'Do you accommodate allergies or dietary restrictions?',
      answer: 'Each product listing includes allergy information. While we take care in our preparation, please note that our kitchen handles common allergens. Contact us for specific dietary concerns or custom requests.'
    },
    {
      question: 'Can I request custom orders?',
      answer: 'Yes! We love working on custom orders for special occasions. Contact us through our Contact page with your requirements, and we\'ll discuss options and pricing.'
    },
    {
      question: 'How should desserts be stored?',
      answer: 'All our desserts should be kept refrigerated and are best enjoyed within 3-4 days. Specific storage instructions may vary by product and will be included with your order.'
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'Orders can be cancelled up to 12 hours before the scheduled delivery/pickup time for a full refund. Cancellations made less than 12 hours in advance may be subject to a cancellation fee.'
    }
  ];

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
              Frequently Asked <span className="gold-accent">Questions</span>
            </h1>
            <p className="text-xl text-brand-light-gray elegant-text">
              Everything you need to know about ordering from MojoDojo
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="premium-card p-8"
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
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
            <p className="text-brand-light-gray mb-4">Still have questions?</p>
            <a href="/contact" className="text-brand-gold hover:underline font-semibold">
              Contact us directly
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
