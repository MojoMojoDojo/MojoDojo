export function PrivacyPage() {
  return (
    <div className="min-h-screen pt-20 pb-20 bg-brand-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 premium-heading">
          Privacy <span className="gold-accent">Policy</span>
        </h1>
        
        <div className="premium-card p-8 space-y-6 text-brand-light-gray elegant-text">
          <section>
            <h2 className="text-2xl font-semibold text-brand-off-white mb-3">Information We Collect</h2>
            <p>
              When you place an order with MojoDojo, we collect information necessary to fulfill your order, 
              including your name, email address, phone number, and delivery address (if applicable).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-brand-off-white mb-3">How We Use Your Information</h2>
            <p>
              Your information is used solely to process and fulfill your orders, communicate order status, 
              and improve our services. We do not sell or share your personal information with third parties 
              except as necessary to complete your order (e.g., delivery services).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-brand-off-white mb-3">Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. All payment 
              information is processed securely through trusted payment providers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-brand-off-white mb-3">Contact</h2>
            <p>
              If you have any questions about our privacy practices, please contact us at hello@mojodojo.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
