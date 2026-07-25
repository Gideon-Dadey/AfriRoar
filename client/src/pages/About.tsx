import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBullseye,
  faGlobeAfrica,
  faListCheck,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { ArrowRight } from 'lucide-react';

const VALUES: ReadonlyArray<{
  icon: IconDefinition;
  title: string;
  desc: string;
}> = [
  {
    icon: faShieldHalved,
    title: 'Trust',
    desc: 'We verify listings carefully and point you to official sources before you apply.',
  },
  {
    icon: faGlobeAfrica,
    title: 'Access',
    desc: 'Built for African students seeking national and international funding pathways.',
  },
  {
    icon: faListCheck,
    title: 'Clarity',
    desc: 'Deadlines, eligibility, and next steps without clutter or guesswork.',
  },
  {
    icon: faBullseye,
    title: 'Momentum',
    desc: 'Drafts, documents, and status tracking so applications actually get finished.',
  },
];

export default function About() {
  return (
    <>
      <Helmet>
        <title>About | AfriRoar</title>
        <meta
          name="description"
          content="AfriRoar helps African students discover scholarships and internships, then track applications from draft to submit."
        />
      </Helmet>

      <div className="bg-[var(--color-sr-bg)]">
        {/* Hero, one composition, brand first, full-bleed image */}
        <section className="relative min-h-[72vh] overflow-hidden bg-[var(--color-sr-navy-deeper)] text-white">
          <picture>
            <source srcSet="/sr/hero/students.webp" type="image/webp" />
            <img
              src="/sr/hero/students.jpg"
              alt="Students collaborating"
              className="sr-hero-peek-img absolute inset-0 h-full w-full object-cover"
              width={1600}
              height={1066}
              decoding="async"
              fetchPriority="high"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-sr-navy-deeper)] via-[var(--color-sr-navy-deeper)]/85 to-[var(--color-sr-navy)]/35" />
          <div className="relative sr-container flex min-h-[72vh] flex-col justify-end pb-14 pt-28 md:pb-20 md:pt-32">
            <p
              className="sr-hero-kicker mb-3 text-[13px] font-bold uppercase tracking-[0.2em] text-[var(--color-sr-yellow)]"
              style={{ fontFamily: 'var(--font-hero)' }}
            >
              AfriRoar
            </p>
            <h1 className="sr-hero-headline max-w-3xl text-[2.4rem] font-bold leading-[1.1] md:text-[3.25rem]">
              Education funding, made findable.
            </h1>
            <p className="sr-hero-copy mt-4 max-w-xl text-[17px] leading-relaxed text-white/85">
              We help African students discover scholarships and internships, then finish the application.
            </p>
            <div className="sr-hero-cta mt-8 flex flex-wrap gap-3">
              <Link
                to="/scholarships"
                className="inline-flex items-center gap-2 bg-[var(--color-sr-yellow)] px-5 py-3 text-[14px] font-bold text-[var(--color-sr-navy-deeper)] transition hover:bg-[var(--color-sr-yellow-hover)]"
              >
                Browse scholarships
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/dashboard/applications/new"
                className="inline-flex items-center gap-2 border border-white/35 px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-white/10"
              >
                Start an application
              </Link>
            </div>
          </div>
        </section>

        {/* Mission, one job */}
        <section className="border-b border-[var(--color-sr-border)] bg-white">
          <div className="sr-container grid gap-10 py-16 md:grid-cols-2 md:items-center md:py-20">
            <div>
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sr-muted)]">
                Our mission
              </p>
              <h2
                className="text-[1.75rem] font-bold leading-tight text-[var(--color-sr-navy-deeper)] md:text-[2rem]"
                style={{ fontFamily: 'var(--font-hero)' }}
              >
                Make funding findable for students who need it most.
              </h2>
              <p className="mt-4 text-[16px] leading-relaxed text-[var(--color-sr-muted)]">
                Too many opportunities stay buried in scattered sites and outdated PDFs. AfriRoar
                brings listings together, explains what matters, and helps you move from interest to
                a submitted application.
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden">
              <picture>
                <source srcSet="/sr/hero/collaborate.webp" type="image/webp" />
                <img
                  src="/sr/hero/collaborate.jpg"
                  alt="Students working together"
                  className="h-full w-full object-cover"
                  width={1600}
                  height={1066}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </div>
          </div>
        </section>

        {/* What we do, one job */}
        <section className="border-b border-[var(--color-sr-border)] bg-[var(--color-sr-bg)]">
          <div className="sr-container py-16 md:py-20">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sr-muted)]">
              What we do
            </p>
            <h2
              className="max-w-2xl text-[1.75rem] font-bold leading-tight text-[var(--color-sr-navy-deeper)] md:text-[2rem]"
              style={{ fontFamily: 'var(--font-hero)' }}
            >
              Find. Prepare. Submit.
            </h2>
            <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-[var(--color-sr-muted)]">
              Three jobs. Done clearly.
            </p>

            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Find',
                  desc: 'Browse curated scholarships and internships by country, level, and deadline.',
                },
                {
                  step: '02',
                  title: 'Prepare',
                  desc: 'Build a strong profile so personal and academic details prefill your drafts.',
                },
                {
                  step: '03',
                  title: 'Submit',
                  desc: 'Complete the five-step wizard, attach documents, review, and send.',
                },
              ].map((item) => (
                <div key={item.step}>
                  <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--color-sr-yellow)]">
                    {item.step}
                  </p>
                  <h3 className="mt-2 text-[1.25rem] font-bold text-[var(--color-sr-navy-deeper)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-sr-muted)]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values, one job, open layout, no glass cards */}
        <section className="border-b border-[var(--color-sr-border)] bg-white">
          <div className="sr-container py-16 md:py-20">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sr-muted)]">
              How we work
            </p>
            <h2
              className="max-w-2xl text-[1.75rem] font-bold leading-tight text-[var(--color-sr-navy-deeper)] md:text-[2rem]"
              style={{ fontFamily: 'var(--font-hero)' }}
            >
              Built for clarity, not clutter.
            </h2>
            <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-[var(--color-sr-muted)]">
              We keep the product honest and useful, especially while we are still early.
            </p>

            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {VALUES.map((value) => (
                <div key={value.title} className="border-t border-[var(--color-sr-border)] pt-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[var(--color-sr-navy)] text-[var(--color-sr-yellow)]">
                      <FontAwesomeIcon icon={value.icon} className="text-[15px]" />
                    </span>
                    <h3 className="text-[1.05rem] font-bold text-[var(--color-sr-navy-deeper)]">
                      {value.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-sr-muted)]">
                    {value.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision, one job */}
        <section className="border-b border-[var(--color-sr-border)] bg-white">
          <div className="sr-container grid gap-10 py-16 md:grid-cols-2 md:items-center md:py-20">
            <div className="relative order-2 aspect-[4/3] overflow-hidden md:order-1">
              <picture>
                <source srcSet="/sr/hero/campus.webp" type="image/webp" />
                <img
                  src="/sr/hero/campus.jpg"
                  alt="University campus"
                  className="h-full w-full object-cover"
                  width={1600}
                  height={1048}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </div>
            <div className="order-1 md:order-2">
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sr-muted)]">
                Our vision
              </p>
              <h2
                className="text-[1.75rem] font-bold leading-tight text-[var(--color-sr-navy-deeper)] md:text-[2rem]"
                style={{ fontFamily: 'var(--font-hero)' }}
              >
                Talent should not stall for lack of a clear path.
              </h2>
              <p className="mt-4 text-[16px] leading-relaxed text-[var(--color-sr-muted)]">
                We want a world where capable students can find real funding routes and finish the
                paperwork without drowning in noise.
              </p>
            </div>
          </div>
        </section>

        {/* CTA, one job */}
        <section className="bg-[var(--color-sr-navy)]">
          <div className="sr-container flex flex-col items-start justify-between gap-6 py-14 md:flex-row md:items-center md:py-16">
            <div className="max-w-xl">
              <h2
                className="text-[1.6rem] font-bold text-white md:text-[1.85rem]"
                style={{ fontFamily: 'var(--font-hero)' }}
              >
                Ready to find your next opportunity?
              </h2>
              <p className="mt-2 text-[15px] text-white/80">
                Browse live listings, or open a draft and start building your packet.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/scholarships"
                className="inline-flex items-center gap-2 bg-[var(--color-sr-yellow)] px-5 py-3 text-[14px] font-bold text-[var(--color-sr-navy-deeper)] transition hover:bg-[var(--color-sr-yellow-hover)]"
              >
                Browse scholarships
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/dashboard/applications/new"
                className="inline-flex items-center gap-2 border border-white/35 px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-white/10"
              >
                Start an application
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
