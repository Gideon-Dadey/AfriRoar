export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8">Last updated: April 2025</p>

      <div className="glass-card p-8 space-y-6 text-[var(--color-text-secondary)] text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">1. Information We Collect</h2>
          <p>We collect information you provide directly: name, email, academic profile, and application data. We also collect usage data such as pages visited and features used.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">2. How We Use Your Information</h2>
          <p>Your data is used to match you with scholarships, process applications, manage subscriptions, send notifications, and improve our platform.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">3. Data Sharing</h2>
          <p>We share application data with scholarship providers when you apply. We use Stripe for payment processing. We do not sell your personal data.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">4. Data Security</h2>
          <p>We use encryption, secure servers, and follow industry best practices to protect your data. Passwords are hashed and never stored in plain text.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">5. Your Rights</h2>
          <p>You can access, update, or delete your account data at any time. Contact privacy@scholarhive.com for data requests.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">6. Cookies</h2>
          <p>We use cookies for authentication, preferences, and analytics. You can control cookie settings in your browser.</p>
        </section>
      </div>
    </div>
  );
}
