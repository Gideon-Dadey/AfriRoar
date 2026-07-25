export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold mb-2">Terms and Conditions</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8">Last updated: April 2025</p>

      <div className="glass-card p-8 space-y-6 text-[var(--color-text-secondary)] text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">1. Acceptance of Terms</h2>
          <p>By accessing and using ScholarHive, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our platform.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">2. Service Description</h2>
          <p>ScholarHive is a platform connecting international students with scholarship opportunities. We provide search, filtering, application management, and subscription services.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">3. User Accounts</h2>
          <p>Users must provide accurate information. You are responsible for maintaining the security of your account. Do not share credentials.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">4. Subscriptions & Payments</h2>
          <p>Premium subscriptions are billed monthly or yearly via Stripe. You may cancel at any time. Refunds follow our refund policy. </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">5. Content & Listings</h2>
          <p>Scholarship providers are responsible for the accuracy of their listings. ScholarHive reviews listings but does not guarantee accuracy or outcomes.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">6. Limitation of Liability</h2>
          <p>ScholarHive is not responsible for scholarship decisions made by providers. We are a platform connecting students with opportunities.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">7. Contact</h2>
          <p>For questions about these terms, contact us at legal@scholarhive.com.</p>
        </section>
      </div>
    </div>
  );
}
