import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const SECTIONS = [
  { id: 'role', label: '1. Our role' },
  { id: 'accuracy', label: '2. Accuracy' },
  { id: 'verify', label: '3. Verify yourself' },
  { id: 'outcomes', label: '4. Outcomes' },
  { id: 'advice', label: '5. Not advice' },
  { id: 'third-party', label: '6. Third parties' },
  { id: 'tools', label: '7. Application tools' },
  { id: 'liability', label: '8. Liability' },
  { id: 'updates', label: '9. Updates' },
  { id: 'contact', label: '10. Contact' },
] as const;

const RELATED = [
  { to: '/terms', label: 'Terms of Use' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/about', label: 'About AfriRoar' },
  { to: '/contact', label: 'Contact' },
] as const;

export default function Disclaimer() {
  return (
    <>
      <Helmet>
        <title>Disclaimer | AfriRoar</title>
        <meta
          name="description"
          content="Important limits on AfriRoar listings and tools, verify official sources before you apply."
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
              Disclaimer
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--color-sr-muted)]">
              AfriRoar helps you find opportunities and organise applications. We are not a funding
              body. Read this before you rely on any listing or tool on the site.
            </p>
            <p className="mt-4 text-[13px] text-[var(--color-sr-muted)]">
              Effective date:{' '}
              <span className="font-medium text-[var(--color-sr-text)]">25 July 2026</span>
            </p>

            {/* Callout, senior craft: lead with the one thing users must not miss */}
            <div className="mt-6 border border-[var(--color-sr-border)] bg-[var(--color-sr-bg)] px-4 py-3 sm:px-5">
              <p className="text-[14px] leading-relaxed text-[var(--color-sr-text)]">
                <span className="font-semibold text-[var(--color-sr-navy-deeper)]">
                  Always verify on the official source.
                </span>{' '}
                Deadlines, eligibility, fees, and requirements can change without notice. Use
                AfriRoar as a starting point, not as the final authority.
              </p>
            </div>

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
            <nav aria-label="Disclaimer sections" className="flex flex-col gap-0.5">
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
            <Section id="role" title="1. Our role">
              <p>
                AfriRoar is a discovery and application-management platform. We curate scholarship
                and internship information and provide tools to help you organise drafts, documents,
                and status.
              </p>
              <p>
                We are not a university, government agency, embassy, bank, or scholarship provider.
                We do not award funding and we do not decide who receives an award.
              </p>
            </Section>

            <Section id="accuracy" title="2. Accuracy of listings">
              <p>
                We take reasonable care when presenting programme information from public sources
                and provider materials. Even so, listings may be incomplete, outdated, mistranslated,
                or wrong.
              </p>
              <p>
                Programme rules change. Pages move. Deadlines shift. AfriRoar does not guarantee that
                any listing is accurate, complete, current, or suitable for your situation.
              </p>
            </Section>

            <Section id="verify" title="3. Verify before you apply">
              <p>Before you spend time or money on an application, confirm on the official site:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Eligibility (nationality, level, field, age, and other criteria)</li>
                <li>Application deadline and timezone</li>
                <li>Required documents and submission channel</li>
                <li>Funding coverage, conditions, and any fees</li>
                <li>Contact details for the programme administrator</li>
              </ul>
              <p>
                If something on AfriRoar conflicts with the official source, trust the official
                source.
              </p>
            </Section>

            <Section id="outcomes" title="4. No guarantee of outcomes">
              <p>
                Using AfriRoar does not increase your chance of an award by itself. Scholarship and
                internship decisions are made solely by the organisations that run those programmes.
              </p>
              <p>
                We are not responsible for rejections, delays, withdrawn offers, visa outcomes, or
                changes to funding after an award is announced.
              </p>
            </Section>

            <Section id="advice" title="5. Not professional advice">
              <p>
                Content on AfriRoar is for general information. It is not legal, financial,
                immigration, tax, or academic counselling. For decisions that affect your education,
                finances, or immigration status, consult qualified professionals and the official
                programme contacts.
              </p>
            </Section>

            <Section id="third-party" title="6. Third-party sites and providers">
              <p>
                Listings often link to external websites. Those sites have their own terms, privacy
                practices, and content. AfriRoar does not control them and is not responsible for
                their accuracy, availability, or security.
              </p>
              <p>
                Treat unexpected requests for payment, personal banking details, or &quot;processing
                fees&quot; with caution. Confirm legitimacy through official channels before sending
                money or sensitive documents.
              </p>
            </Section>

            <Section id="tools" title="7. Application tools">
              <p>
                Profile fields, drafts, uploads, and the application wizard are productivity tools.
                They do not replace an official application unless a provider explicitly uses
                AfriRoar as their submission channel.
              </p>
              <p>
                You are responsible for the accuracy of what you submit, for meeting provider
                deadlines, and for keeping your own copies of important files.
              </p>
            </Section>

            <Section id="liability" title="8. Limitation of liability">
              <p>
                To the fullest extent permitted by law, AfriRoar is not liable for losses arising
                from reliance on listings, missed deadlines, third-party website changes, provider
                decisions, or use of our tools, except where we cannot exclude liability by law.
              </p>
              <p>
                Additional terms appear in our{' '}
                <Link
                  to="/terms"
                  className="font-medium text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
                >
                  Terms of Use
                </Link>
                .
              </p>
            </Section>

            <Section id="updates" title="9. Updates to this disclaimer">
              <p>
                We may revise this Disclaimer as the product evolves. The effective date at the top
                of this page will change when we do. Continued use of AfriRoar after an update means
                you accept the revised Disclaimer.
              </p>
            </Section>

            <Section id="contact" title="10. Contact" last>
              <p>
                Questions about this Disclaimer: use our{' '}
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
                Related:{' '}
                <Link
                  to="/terms"
                  className="font-medium text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
                >
                  Terms of Use
                </Link>
                {' · '}
                <Link
                  to="/privacy"
                  className="font-medium text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
                >
                  Privacy Policy
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
