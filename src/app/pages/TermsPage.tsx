export function TermsPage() {
  return (
    <div className="min-h-screen pt-20 pb-20 bg-brand-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 premium-heading">
          Terms of <span className="gold-accent">Service</span>
        </h1>
        
        <div className="premium-card p-8 space-y-6 text-brand-light-gray elegant-text">
          <section>
            <h2 className="text-2xl font-semibold text-brand-off-white mb-3">Order Acceptance</h2>
            <p>
              All orders are subject to acceptance and availability. We reserve the right to refuse or cancel 
              any order for any reason, including product availability, errors in pricing or product information, 
              or suspected fraudulent activity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-brand-off-white mb-3">Pricing</h2>
            <p>
              All prices are in Canadian dollars (CAD) and are subject to change without notice. We strive to 
              ensure all pricing information is accurate, but errors may occur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-brand-off-white mb-3">Cancellation Policy</h2>
            <p>
              Orders can be cancelled up to 12 hours before the scheduled delivery/pickup time for a full refund. 
              Cancellations made less than 12 hours in advance may be subject to a 50% cancellation fee.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-brand-off-white mb-3">Food Allergy Disclaimer</h2>
            <p>
              While we provide allergy information for our products, our kitchen handles common allergens including 
              dairy, eggs, gluten, nuts, and soy. We cannot guarantee that any product is completely free from allergens. 
              Customers with severe allergies should exercise caution and contact us with specific concerns.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-brand-off-white mb-3">Limitation of Liability</h2>
            <p>
              MojoDojo is not liable for any indirect, incidental, special, or consequential damages arising from 
              the use of our products or services.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
