import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const SLIDES = [
  {
    src: '/sr/hero/panel-1.jpg',
    alt: 'University of Nairobi graduate celebrating academic achievement',
    label: 'Graduate · Nairobi',
  },
  {
    src: '/sr/hero/panel-2.jpg',
    alt: 'African student working on a laptop against a bright white campus backdrop',
    label: 'Bright futures start here',
  },
  {
    src: '/sr/hero/panel-4.jpg',
    alt: 'African graduates smiling together after commencement',
    label: 'Celebrate the win',
  },
  {
    src: '/sr/hero/panel-3.jpg',
    alt: 'African student smiling while studying with a laptop outdoors',
    label: 'Study with focus',
  },
  {
    src: '/sr/hero/panel-7.jpg',
    alt: 'African student on a bright campus walkway',
    label: 'Campus paths open',
  },
  {
    src: '/sr/hero/panel-5.jpg',
    alt: 'African student concentrating on scholarship applications',
    label: 'Apply with confidence',
  },
] as const;

const INTERVAL_MS = 5000;

export default function HeroSection() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState<'next' | 'prev'>('next');
  const touchStartX = useRef<number | null>(null);

  const len = SLIDES.length;

  const goTo = useCallback(
    (next: number, direction: 'next' | 'prev' = 'next') => {
      setDir(direction);
      setIndex(((next % len) + len) % len);
    },
    [len],
  );

  const next = useCallback(() => goTo(index + 1, 'next'), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1, 'prev'), [goTo, index]);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setDir('next');
      setIndex((i) => (i + 1) % len);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused, len]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 48) return;
    if (delta < 0) next();
    else prev();
  };

  const active = SLIDES[index];
  const peek = SLIDES[(index + 1) % len];

  return (
    <section
      className="sr-hero-slice relative overflow-hidden bg-[var(--color-sr-navy-deeper)] text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label="AfriRoar scholarship stories"
    >
      {/* Full-bleed sliding photography — Buddy4Study motion, elevated */}
      <div className="absolute inset-0">
        {SLIDES.map((slide, i) => {
          const isActive = i === index;
          return (
            <div
              key={slide.src}
              className={[
                'sr-hero-slide absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
                isActive
                  ? 'z-[1] opacity-100'
                  : 'z-0 opacity-0 pointer-events-none',
                isActive && dir === 'next' ? 'sr-hero-slide-in-right' : '',
                isActive && dir === 'prev' ? 'sr-hero-slide-in-left' : '',
              ].join(' ')}
              aria-hidden={!isActive}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                className={[
                  'h-full w-full object-cover object-[72%_center] transition-transform duration-[5000ms] ease-out',
                  isActive ? 'scale-105' : 'scale-100',
                ].join(' ')}
                draggable={false}
              />
            </div>
          );
        })}

        {/* Original navy veil — readable copy on left, photography open on right */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-r from-[var(--color-sr-navy-deeper)] via-[var(--color-sr-navy-deeper)]/88 to-[var(--color-sr-navy-deeper)]/20" />
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-[var(--color-sr-navy-deeper)]/70 via-transparent to-[var(--color-sr-navy-deeper)]/25" />
      </div>

      {/* Diagonal peek strip of the next slide — extraordinary depth */}
      <div
        className="sr-hero-peek pointer-events-none absolute inset-y-0 right-0 z-[3] hidden w-[38%] overflow-hidden lg:block"
        aria-hidden="true"
      >
        <div className="sr-hero-peek-inner relative h-full w-full">
          <img
            key={peek.src}
            src={peek.src}
            alt=""
            className="sr-hero-peek-img h-full w-full object-cover object-[60%_center]"
          />
          <div className="absolute inset-0 bg-[var(--color-sr-navy)]/20 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[var(--color-sr-navy-deeper)]/35" />
        </div>
      </div>

      <div className="sr-container relative z-10 flex min-h-[76vh] items-center py-16 md:min-h-[82vh] md:py-20">
        <div className="max-w-xl lg:max-w-2xl">
          <p className="sr-hero-kicker mb-4 text-[13px] font-semibold uppercase tracking-[0.22em] text-[var(--color-sr-yellow)]">
            AfriRoar
          </p>
          <h1 className="sr-hero-headline text-[2.35rem] font-bold leading-[1.12] md:text-[3.4rem] md:leading-[1.08]">
            Scholarships that open Africa to the world
          </h1>
          <p className="sr-hero-copy mt-5 max-w-lg text-[17px] leading-relaxed text-white/85 md:text-[18px]">
            Discover verified funding, internships, and application guidance built for African
            students ready to study, lead, and return impact home.
          </p>

          <div className="sr-hero-cta mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/scholarships"
              className="inline-flex items-center gap-2 bg-[var(--color-sr-yellow)] px-5 py-3 text-[15px] font-bold text-[var(--color-sr-navy-deeper)] transition-transform duration-300 hover:translate-y-[-1px] hover:bg-[#e0b400]"
            >
              Browse scholarships
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 border border-white/35 bg-white/5 px-5 py-3 text-[15px] font-semibold text-white backdrop-blur-sm transition-colors duration-300 hover:border-white/70 hover:bg-white/10"
            >
              Create student account
            </Link>
          </div>

          {/* Slide chrome — Buddy4Study arrows + progress */}
          <div className="sr-hero-chrome mt-10 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous slide"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-md transition hover:border-[var(--color-sr-yellow)] hover:bg-[var(--color-sr-yellow)] hover:text-[var(--color-sr-navy-deeper)]"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next slide"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-md transition hover:border-[var(--color-sr-yellow)] hover:bg-[var(--color-sr-yellow)] hover:text-[var(--color-sr-navy-deeper)]"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2" role="tablist" aria-label="Slide indicators">
              {SLIDES.map((slide, i) => (
                <button
                  key={slide.src}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Show slide ${i + 1}: ${slide.label}`}
                  onClick={() => goTo(i, i > index ? 'next' : 'prev')}
                  className={[
                    'h-1.5 rounded-full transition-all duration-500',
                    i === index
                      ? 'w-9 bg-[var(--color-sr-yellow)]'
                      : 'w-2.5 bg-white/35 hover:bg-white/60',
                  ].join(' ')}
                />
              ))}
            </div>

            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/55">
              {active.label}
            </p>
          </div>
        </div>
      </div>

      {/* Autoplay progress bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-[3px] bg-white/10">
        <div
          key={`${index}-${paused}`}
          className={['h-full bg-[var(--color-sr-yellow)]', paused ? '' : 'sr-hero-progress'].join(' ')}
          style={paused ? { width: '0%' } : undefined}
        />
      </div>
    </section>
  );
}
