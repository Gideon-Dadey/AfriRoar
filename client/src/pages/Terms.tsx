import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const SECTIONS = [
  { id: 'acceptance', label: '1. Acceptance' },
  { id: 'service', label: '2. The service' },
  { id: 'accounts', label: '3. Accounts' },
  { id: 'use', label: '4. Acceptable use' },
  { id: 'listings', label: '5. Listings & accuracy' },
  { id: 'applications', label: '6. Applications' },
  { id: 'payments', label: '7. Paid plans' },
  { id: 'ip', label: '8. Intellectual property' },
  { id: 'liability', label: '9. Liability' },
  { id: 'termination', label: '10. Termination' },
  { id: 'changes', label: '11. Changes' },
  { id: 'contact', label: '12. Contact' },
] as const;

const RELATED = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/disclaimer', label: 'Disclaimer' },
  { to: '/about', label: 'About AfriRoar' },
  { to: '/contact', label: 'Contact' },
] as const;

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Terms of Use | AfriRoar</title>
        <meta
          name="description"
          content="Terms of Use for AfriRoar, the rules for using our scholarship discovery and application tools."
        />
      </Helmet>

      <div className="bg-[var(--color-sr-bg)]">
        {/* Compact legal header, not a marketing hero */}
        <header className="border-b border-[var(--color-sr-border)] bg-white">
          <div className="sr-container py-10 md:py-14">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sr-muted)]">
              Legal
            </p>
            <h1
              className="text-[2rem] font-bold leading-tight text-[var(--color-sr-navy-deeper)] md:text-[2.35rem]"
              style={{ fontFamily: 'var(--font-hero)' }}
            >
              Terms of Use
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--color-sr-muted)]">
              These terms govern your use of AfriRoar.com and related services. Please read them
              carefully before creating an account or submitting an application.
            </p>
            <p className="mt-4 text-[13px] text-[var(--color-sr-muted)]">
              Effective date: <span className="font-medium text-[var(--color-sr-text)]">25 July 2026</span>
            </p>

            <nav
              aria-label="Related legal pages"
              className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--color-sr-border)] pt-5"
            >
              {RELATED.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-[13px] font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <div className="sr-container grid gap-10 py-10 md:grid-cols-[220px_minmax(0,1fr)] md:gap-14 md:py-14">
          {/* Sticky TOC */}
          <aside className="md:sticky md:top-24 md:self-start">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sr-muted)]">
              On this page
            </p>
            <nav
              aria-label="Terms sections"
              className="flex flex-col gap-0.5"
            >
              {SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="border-l-2 border-transparent px-3 py-1.5 text-[13px] font-medium text-[var(--color-sr-muted)] transition hover:border-[var(--color-sr-navy)] hover:text-[var(--color-sr-navy-deeper)]"
                >
                  {section.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Body */}
          <article className="max-w-3xl space-y-0 bg-white px-5 py-2 sm:px-8 sm:py-4 md:border md:border-[var(--color-sr-border)]">
            <Section id="acceptance" title="1. Acceptance of terms">
              <p>
                By accessing or using AfriRoar, you agree to these Terms of Use and our{' '}
                <Link to="/privacy" className="font-medium text-[var(--color-sr-navy)] underline-offset-2 hover:underline">
                  Privacy Policy
                </Link>
                . If you do not agree, do not use the service.
              </p>
              <p>
                If you use AfriRoar on behalf of an organisation, you confirm that you have authority
                to bind that organisation to these terms.
              </p>
            </Section>

            <Section id="service" title="2. The service">
              <p>
                AfriRoar is a scholarship and internship discovery platform. We help students find
                opportunities, build a profile, and manage application drafts through our tools.
              </p>
              <p>
                We are not a university, funding body, or scholarship provider. Award decisions are
                made solely by the organisations that run those programmes. See our{' '}
                <Link to="/disclaimer" className="font-medium text-[var(--color-sr-navy)] underline-offset-2 hover:underline">
                  Disclaimer
                </Link>{' '}
                for more detail.
              </p>
            </Section>

            <Section id="accounts" title="3. Accounts">
              <p>
                You must provide accurate registration details and keep them up to date. You are
                responsible for activity under your account and for keeping your password
                confidential.
              </p>
              <p>
                Notify us promptly at{' '}
                <a
                  href="mailto:afriroar.support@gmail.com"
                  className="font-medium text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
                >
                  afriroar.support@gmail.com
                </a>{' '}
                if you suspect unauthorised access. We may suspend or close accounts that appear
                compromised, abusive, or fraudulent.
              </p>
            </Section>

            <Section id="use" title="4. Acceptable use">
              <p>You agree not to:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Misrepresent your identity, academic history, or eligibility</li>
                <li>Upload unlawful, harmful, or infringing content</li>
                <li>Scrape, harvest, or reverse-engineer the platform beyond normal use</li>
                <li>Interfere with security, rate limits, or other users&apos; access</li>
                <li>Use AfriRoar to spam providers or submit mass fraudulent applications</li>
              </ul>
            </Section>

            <Section id="listings" title="5. Listings and accuracy">
              <p>
                We curate and present scholarship and internship information from public sources and
                programme materials. We take reasonable care, but listings may change, expire, or
                contain errors.
              </p>
              <p>
                Always verify deadlines, eligibility, and requirements on the official programme
                website before you apply. AfriRoar does not guarantee that any listing is complete,
                current, or suitable for you.
              </p>
            </Section>

            <Section id="applications" title="6. Applications and documents">
              <p>
                Application drafts, uploaded documents, and profile data are tools to help you
                organise your work. Submitting through AfriRoar does not replace any official
                application process required by a provider, unless that provider explicitly uses
                AfriRoar as their channel.
              </p>
              <p>
                You are responsible for the accuracy of materials you upload and for meeting
                provider deadlines. Keep your own copies of important documents.
              </p>
            </Section>

            <Section id="payments" title="7. Paid plans">
              <p>
                Some features may be offered under a free plan and others under a paid subscription.
                If you purchase a paid plan, pricing, billing interval, and included features will
                be shown at checkout.
              </p>
              <p>
                Paid plans may be processed by a third-party payment provider (such as Stripe). You
                authorise us and that provider to charge the payment method you provide. Unless
                required by law or stated at purchase, fees are non-refundable once a billing period
                has started. You may cancel renewal at any time; access continues until the end of
                the paid period.
              </p>
            </Section>

            <Section id="ip" title="8. Intellectual property">
              <p>
                AfriRoar branding, interface, and original content are owned by AfriRoar or its
                licensors. You may not copy, redistribute, or commercially exploit our materials
                without written permission.
              </p>
              <p>
                You retain rights to content you upload. You grant AfriRoar a limited licence to
                host, process, and display that content as needed to operate the service.
              </p>
            </Section>

            <Section id="liability" title="9. Disclaimers and liability">
              <p>
                The service is provided &quot;as is&quot; and &quot;as available.&quot; To the fullest
                extent permitted by law, AfriRoar disclaims warranties of accuracy, fitness for a
                particular purpose, and non-infringement.
              </p>
              <p>
                AfriRoar is not liable for scholarship outcomes, provider decisions, missed
                deadlines, third-party website changes, or losses arising from reliance on listing
                information. Where liability cannot be excluded, it is limited to the amount you
                paid us for the service in the three months before the claim (or zero if you used
                only free features).
              </p>
            </Section>

            <Section id="termination" title="10. Termination">
              <p>
                You may stop using AfriRoar and request account deletion at any time. We may
                suspend or terminate access if you breach these terms, create risk for other users,
                or if we discontinue the service.
              </p>
              <p>
                Provisions that by nature should survive (including intellectual property,
                disclaimers, and liability limits) continue after termination.
              </p>
            </Section>

            <Section id="changes" title="11. Changes to these terms">
              <p>
                We may update these Terms of Use as the product evolves. When we do, we will revise
                the effective date on this page. Continued use after changes take effect means you
                accept the updated terms. If you do not agree, stop using the service.
              </p>
            </Section>

            <Section id="contact" title="12. Contact" last>
              <p>
                Questions about these terms: use our{' '}
                <Link to="/contact" className="font-medium text-[var(--color-sr-navy)] underline-offset-2 hover:underline">
                  contact form
                </Link>{' '}
                or email{' '}
                <a
                  href="mailto:afriroar.support@gmail.com"
                  className="font-medium text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
                >
                  afriroar.support@gmail.com
                </a>
                .
              </p>
              <p className="!mb-0">
                Related policies:{' '}
                <Link to="/privacy" className="font-medium text-[var(--color-sr-navy)] underline-offset-2 hover:underline">
                  Privacy Policy
                </Link>
                {' · '}
                <Link to="/disclaimer" className="font-medium text-[var(--color-sr-navy)] underline-offset-2 hover:underline">
                  Disclaimer
                </Link>
              </p>
            </Section>
          </article>
        </div>
      </div>
    </>
  );
}

function Section({
  id,
  title,
  children,
  last = false,
}: {
  id: string;
  title: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-28 py-8 ${last ? '' : 'border-b border-[var(--color-sr-border)]'}`}
    >
      <h2 className="text-[1.15rem] font-bold text-[var(--color-sr-navy-deeper)]">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-[var(--color-sr-muted)] [&_p]:mb-0">
        {children}
      </div>
    </section>
  );
}
