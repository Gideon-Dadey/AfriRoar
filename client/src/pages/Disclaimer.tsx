export default function Disclaimer() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold mb-2">Scholarship Disclaimer</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8">Last updated: April 2025</p>

      <div className="glass-card p-8 space-y-6 text-[var(--color-text-secondary)] text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">Important Notice</h2>
          <p>ScholarHive is a scholarship discovery and application management platform. We aggregate scholarship information from various sources and scholarship providers.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">No Guarantee</h2>
          <p>ScholarHive does not guarantee the accuracy, completeness, or availability of any scholarship listing. Scholarship decisions are made solely by the scholarship providers.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">Verification</h2>
          <p>While we verify listings to the best of our ability, we recommend that users independently verify scholarship details before applying. Always check official sources.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">No Financial Advice</h2>
          <p>Information on our platform does not constitute financial or educational advice. Consult relevant professionals for personalized guidance.</p>
        </section>
      </div>
    </div>
  );
}
