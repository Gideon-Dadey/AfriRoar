import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const SECTIONS = [
  { id: 'overview', label: '1. Overview' },
  { id: 'collect', label: '2. What we collect' },
  { id: 'use', label: '3. How we use data' },
  { id: 'share', label: '4. Sharing' },
  { id: 'storage', label: '5. Storage & security' },
  { id: 'retention', label: '6. Retention' },
  { id: 'rights', label: '7. Your rights' },
  { id: 'cookies', label: '8. Cookies' },
  { id: 'children', label: '9. Children' },
  { id: 'changes', label: '10. Changes' },
  { id: 'contact', label: '11. Contact' },
] as const;

const RELATED = [
  { to: '/terms', label: 'Terms of Use' },
  { to: '/disclaimer', label: 'Disclaimer' },
  { to: '/about', label: 'About AfriRoar' },
  { to: '/contact', label: 'Contact' },
] as const;

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | AfriRoar</title>
        <meta
          name="description"
          content="How AfriRoar collects, uses, and protects your personal data when you discover scholarships and manage applications."
        />
      </Helmet>

      <div className="bg-[var(--color-sr-bg)]">
        <header className="border-b border-[var(--color-sr-border)] bg-white">
          <div className="sr-container py-10 md:py-14">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sr-muted)]">
              Legal
            </p>
            <h1
              className="text-[2rem] font-bold leading-tight text-[var(--color-sr-navy-deeper)] md:text-[2.35rem]"
              style={{ fontFamily: 'var(--font-hero)' }}
            >
              Privacy Policy
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--color-sr-muted)]">
              This policy explains what personal data AfriRoar collects, why we collect it, and the
              choices you have. We keep this plain on purpose.
            </p>
            <p className="mt-4 text-[13px] text-[var(--color-sr-muted)]">
              Effective date:{' '}
              <span className="font-medium text-[var(--color-sr-text)]">25 July 2026</span>
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
          <aside className="md:sticky md:top-24 md:self-start">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sr-muted)]">
              On this page
            </p>
            <nav aria-label="Privacy sections" className="flex flex-col gap-0.5">
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

          <article className="max-w-3xl space-y-0 bg-white px-5 py-2 sm:px-8 sm:py-4 md:border md:border-[var(--color-sr-border)]">
            <Section id="overview" title="1. Overview">
              <p>
                AfriRoar (&quot;we&quot;, &quot;us&quot;) operates AfriRoar.com, a scholarship and
                internship discovery platform with profile and application tools. This policy covers
                data processed when you browse listings, create an account, sign in (including with
                Google where enabled), build a profile, or manage applications.
              </p>
              <p>
                By using AfriRoar, you acknowledge this policy. Our{' '}
                <Link
                  to="/terms"
                  className="font-medium text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
                >
                  Terms of Use
                </Link>{' '}
                describe the rules for using the service.
              </p>
            </Section>

            <Section id="collect" title="2. What we collect">
              <p>
                <span className="font-medium text-[var(--color-sr-text)]">Account data.</span> Name,
                email address, password (stored hashed, never in plain text), and account status.
                If you use Google Sign-In, we receive your Google account identifier, name, and
                email from Google&apos;s token verification.
              </p>
              <p>
                <span className="font-medium text-[var(--color-sr-text)]">Profile data.</span>{' '}
                Academic and personal details you choose to add, for example education history,
                country, interests, and avatar, so drafts can prefill more accurately.
              </p>
              <p>
                <span className="font-medium text-[var(--color-sr-text)]">Application data.</span>{' '}
                Draft and submitted application answers, document uploads (such as CVs or
                transcripts), and application status.
              </p>
              <p>
                <span className="font-medium text-[var(--color-sr-text)]">Technical data.</span>{' '}
                Basic logs needed to run the service securely: IP address, browser type, request
                timestamps, and error diagnostics. We do not sell advertising profiles built from
                this.
              </p>
              <p>
                <span className="font-medium text-[var(--color-sr-text)]">Payment data.</span> If you
                buy a paid plan, payment card details are handled by our payment processor (for
                example Stripe). We store subscription status and related identifiers, not full
                card numbers.
              </p>
            </Section>

            <Section id="use" title="3. How we use data">
              <p>We use personal data to:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Create and secure your account, and verify your email when required</li>
                <li>Show scholarship and internship listings relevant to your interests</li>
                <li>Power profile, draft, document, and application workflows</li>
                <li>Send transactional messages (verification, password reset, important notices)</li>
                <li>Process paid plans and prevent fraud or abuse</li>
                <li>Improve reliability, fix bugs, and understand how the product is used</li>
              </ul>
              <p>
                We do not sell your personal data. We do not use your application documents to train
                public AI models.
              </p>
            </Section>

            <Section id="share" title="4. When we share data">
              <p>We share data only when needed to operate AfriRoar:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  <span className="font-medium text-[var(--color-sr-text)]">Service providers</span>
                  : hosting, email delivery, and payment processing under contracts that limit how
                  they may use your data
                </li>
                <li>
                  <span className="font-medium text-[var(--color-sr-text)]">Google</span>: only if
                  you choose Google Sign-In, so we can authenticate you
                </li>
                <li>
                  <span className="font-medium text-[var(--color-sr-text)]">Scholarship providers</span>
                  : only when you explicitly submit an application intended for them, and only the
                  fields and files needed for that submission
                </li>
                <li>
                  <span className="font-medium text-[var(--color-sr-text)]">Legal requests</span>:
                  when required by law or to protect users, AfriRoar, or the public from harm or
                  fraud
                </li>
              </ul>
            </Section>

            <Section id="storage" title="5. Storage and security">
              <p>
                Data is stored on secured servers. Passwords are hashed. Access to production systems
                is restricted. No method of transmission or storage is perfectly secure; we work to
                reduce risk and respond promptly if we detect a serious incident affecting your data.
              </p>
              <p>
                You can help by choosing a strong unique password and logging out on shared devices.
              </p>
            </Section>

            <Section id="retention" title="6. Retention">
              <p>
                We keep account and application data while your account is active and for a
                reasonable period afterward so you can recover drafts, meet legal obligations, or
                resolve disputes. You may request deletion (see Your rights). Some records may remain
                in backups for a limited time before they are purged.
              </p>
            </Section>

            <Section id="rights" title="7. Your rights">
              <p>Depending on where you live, you may have rights to:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Access the personal data we hold about you</li>
                <li>Correct inaccurate profile or account details</li>
                <li>Delete your account and associated personal data</li>
                <li>Export a copy of data you provided</li>
                <li>Object to or restrict certain processing, where the law allows</li>
              </ul>
              <p>
                Many updates you can make yourself in{' '}
                <Link
                  to="/dashboard/profile"
                  className="font-medium text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
                >
                  Profile
                </Link>
                . For deletion or other requests, email{' '}
                <a
                  href="mailto:afriroar.support@gmail.com"
                  className="font-medium text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
                >
                  afriroar.support@gmail.com
                </a>
                . We may need to verify your identity before fulfilling a request.
              </p>
            </Section>

            <Section id="cookies" title="8. Cookies and local storage">
              <p>
                We use essential browser storage to keep you signed in (for example authentication
                tokens) and to remember basic preferences. These are required for the product to
                work.
              </p>
              <p>
                If we add optional analytics later, we will update this policy and, where required,
                ask for consent. You can clear cookies and site data in your browser settings; doing
                so may sign you out.
              </p>
            </Section>

            <Section id="children" title="9. Children">
              <p>
                AfriRoar is aimed at students pursuing higher education and related opportunities.
                We do not knowingly collect personal data from children under 16. If you believe a
                child has created an account, contact us and we will delete it.
              </p>
            </Section>

            <Section id="changes" title="10. Changes to this policy">
              <p>
                We may update this Privacy Policy as the product or law changes. When we do, we will
                revise the effective date on this page. Continued use after changes take effect means
                you accept the updated policy. If changes are material, we will provide additional
                notice where practical.
              </p>
            </Section>

            <Section id="contact" title="11. Contact" last>
              <p>
                Privacy questions or data requests: use our{' '}
                <Link to="/contact" className="font-medium text-[var(--color-sr-navy)] underline-offset-2 hover:underline">
                  contact form
                </Link>{' '}
                (topic: Privacy request) or email{' '}
                <a
                  href="mailto:afriroar.support@gmail.com"
                  className="font-medium text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
                >
                  afriroar.support@gmail.com
                </a>
                .
              </p>
              <p className="!mb-0">
                Related:{' '}
                <Link
                  to="/terms"
                  className="font-medium text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
                >
                  Terms of Use
                </Link>
                {' · '}
                <Link
                  to="/disclaimer"
                  className="font-medium text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
                >
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
