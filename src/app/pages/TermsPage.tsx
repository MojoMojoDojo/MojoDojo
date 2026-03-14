import { useLanguage } from '../contexts/LanguageContext';

export function TermsPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen pt-20 pb-20 bg-brand-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 premium-heading">
          {t.terms.title} <span className="gold-accent">{t.terms.titleAccent}</span>
        </h1>
        <div className="premium-card p-8 space-y-6 text-brand-light-gray elegant-text">
          {t.terms.sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-2xl font-semibold text-brand-off-white mb-3">{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
