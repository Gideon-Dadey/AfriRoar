import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Check, ArrowRight } from 'lucide-react';

const freeFeatures = [
  'Browse verified scholarships and internships',
  'Advanced search & filters (level, funding, deadline)',
  'Save scholarships and get deadline reminders',
  'Multi-step applications with document uploads',
  'Application tracking and in-app notifications',
  'Guides, lists, and country hubs',
];

export default function Pricing() {
  return (
    <>
      <Helmet>
        <title>Pricing | AfriRoar</title>
        <meta
          name="description"
          content="AfriRoar is free for students while we grow. Create an account to save scholarships, apply, and track deadlines."
        />
      </Helmet>

      <div className="bg-[var(--color-sr-navy)] text-white">
        <div className="sr-container py-10 md:py-14">
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sr-yellow)]">
            Pricing
          </p>
          <h1 className="max-w-2xl text-3xl font-bold md:text-4xl">Free for students</h1>
          <p className="mt-3 max-w-2xl text-white/85">
            AfriRoar is currently free while we expand verified listings. Create an account to save
            programmes, draft applications, and receive deadline alerts. Paid plans may return later —
            we will not advertise features we do not ship.
          </p>
        </div>
      </div>

      <div className="sr-container grid grid-cols-1 gap-8 py-10 lg:grid-cols-[1fr_340px]">
        <div className="border border-[var(--color-sr-border)] bg-white p-6 md:p-8">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-sr-muted)]">
            Student plan
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[var(--color-sr-navy-deeper)]">$0</span>
            <span className="text-[var(--color-sr-muted)]">forever (for now)</span>
          </div>
          <ul className="mt-6 space-y-3">
            {freeFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-[15px] text-[var(--color-sr-text)]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-sr-navy)]" />
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-[var(--color-sr-yellow)] px-5 py-2.5 text-[14px] font-bold text-[var(--color-sr-navy-deeper)] hover:bg-[var(--color-sr-yellow-hover)]"
            >
              Create free account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/scholarships"
              className="inline-flex items-center gap-2 border border-[var(--color-sr-border)] px-5 py-2.5 text-[14px] font-semibold text-[var(--color-sr-navy)] hover:border-[var(--color-sr-navy)]"
            >
              Browse scholarships
            </Link>
          </div>
        </div>

        <aside className="border border-[var(--color-sr-border)] bg-white p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-sr-muted)]">
            Coming later
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-sr-text)]">
            Optional Premium (early access listings, priority support) will only launch when billing
            and entitlements are fully wired. Until then, every core feature above is included free.
          </p>
          <Link
            to="/contact"
            className="mt-4 inline-flex text-[14px] font-semibold text-[var(--color-sr-link)] hover:underline"
          >
            Ask about partnerships
          </Link>
        </aside>
      </div>
    </>
  );
}
