import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const SLIDES = [
  {
    src: '/sr/hero/slide-1',
    alt: 'Students collaborating at a workstation in a modern learning space',
    label: 'Build with peers',
  },
  {
    src: '/sr/hero/slide-2',
    alt: 'African university students solving equations together at a classroom chalkboard',
    label: 'Serious study',
  },
  {
    src: '/sr/hero/slide-3',
    alt: 'Diverse students studying outdoors on a university campus',
    label: 'Campus focus',
  },
  {
    src: '/sr/hero/slide-4',
    alt: 'Historic university campus building across a green lawn',
    label: 'Real institutions',
  },
  {
    src: '/sr/hero/slide-5',
    alt: 'Diverse young professionals collaborating around a meeting table',
    label: 'Opportunity ahead',
  },
  {
    src: '/sr/hero/slide-6',
    alt: 'Professionals brainstorming together at a glass whiteboard',
    label: 'Mature craft',
  },
] as const;

const INTERVAL_MS = 5000;

function HeroPicture({
  srcBase,
  alt,
  className,
  priority = false,
}: {
  srcBase: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <picture>
      <source srcSet={`${srcBase}.webp`} type="image/webp" />
      <img
        src={`${srcBase}.jpg`}
        alt={alt}
        className={className}
        draggable={false}
        decoding={priority ? 'sync' : 'async'}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'low'}
        width={1600}
        height={1066}
      />
    </picture>
  );
}

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

  // Warm the next slide image so transitions feel instant
  useEffect(() => {
    const peek = SLIDES[(index + 1) % len];
    const img = new Image();
    img.src = `${peek.src}.webp`;
  }, [index, len]);

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
      <div className="absolute inset-0">
        {SLIDES.map((slide, i) => {
          const isActive = i === index;
          return (
            <div
              key={slide.src}
              className={[
                'sr-hero-slide absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
                isActive ? 'z-[1] opacity-100' : 'z-0 opacity-0 pointer-events-none',
                isActive && dir === 'next' ? 'sr-hero-slide-in-right' : '',
                isActive && dir === 'prev' ? 'sr-hero-slide-in-left' : '',
              ].join(' ')}
              aria-hidden={!isActive}
            >
              <HeroPicture
                srcBase={slide.src}
                alt={slide.alt}
                priority={i === 0}
                className={[
                  'h-full w-full object-cover object-[68%_center] transition-transform duration-[5000ms] ease-out',
                  isActive ? 'scale-105' : 'scale-100',
                ].join(' ')}
              />
            </div>
          );
        })}

        <div className="absolute inset-0 z-[2] bg-gradient-to-r from-[var(--color-sr-navy-deeper)] via-[var(--color-sr-navy-deeper)]/88 to-[var(--color-sr-navy-deeper)]/20" />
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-[var(--color-sr-navy-deeper)]/70 via-transparent to-[var(--color-sr-navy-deeper)]/25" />
      </div>

      <div
        className="sr-hero-peek pointer-events-none absolute inset-y-0 right-0 z-[3] hidden w-[38%] overflow-hidden lg:block"
        aria-hidden="true"
      >
        <div className="sr-hero-peek-inner relative h-full w-full">
          <HeroPicture
            key={peek.src}
            srcBase={peek.src}
            alt=""
            className="sr-hero-peek-img h-full w-full object-cover object-[60%_center]"
          />
          <div className="absolute inset-0 bg-[var(--color-sr-navy)]/20 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[var(--color-sr-navy-deeper)]/35" />
        </div>
      </div>

      <div className="sr-container relative z-10 flex min-h-[76vh] items-center py-16 md:min-h-[82vh] md:py-20">
        <div className="max-w-xl lg:max-w-2xl">
          <h1 className="sr-hero-headline text-[2.35rem] font-bold leading-[1.12] md:text-[3.4rem] md:leading-[1.08]">
            AfriRoar
          </h1>
          <p className="mt-3 text-[1.15rem] font-semibold leading-snug text-[var(--color-sr-yellow)] md:text-[1.35rem]">
            Scholarships that open Africa to the world
          </p>
          <p className="sr-hero-copy mt-5 max-w-lg text-[17px] leading-relaxed text-white/85 md:text-[18px]">
            AfriRoar is a scholarship and careers platform for African students. Create an account
            to discover verified funding and internships, save applications, upload documents, and
            follow clear guides from search to submit.
          </p>

          <div className="sr-hero-cta mt-7 flex w-full flex-col gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              to="/scholarships"
              className="inline-flex w-full items-center justify-center gap-2 bg-[var(--color-sr-yellow)] px-5 py-3.5 text-[15px] font-bold text-[var(--color-sr-navy-deeper)] transition-transform duration-300 hover:translate-y-[-1px] hover:bg-[#e0b400] sm:w-auto sm:py-3"
            >
              Browse scholarships
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex w-full items-center justify-center gap-2 border border-white/35 bg-white/5 px-5 py-3.5 text-[15px] font-semibold text-white backdrop-blur-sm transition-colors duration-300 hover:border-white/70 hover:bg-white/10 sm:w-auto sm:py-3"
            >
              Create student account
            </Link>
          </div>

          <div className="sr-hero-chrome mt-8 flex w-full flex-col gap-4 sm:mt-10 sm:flex-row sm:items-center sm:gap-5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous slide"
                className="flex h-11 w-11 items-center justify-center border border-white/35 text-white transition hover:border-[var(--color-sr-yellow)] hover:bg-[var(--color-sr-yellow)] hover:text-[var(--color-sr-navy-deeper)]"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next slide"
                className="flex h-11 w-11 items-center justify-center border border-white/35 text-white transition hover:border-[var(--color-sr-yellow)] hover:bg-[var(--color-sr-yellow)] hover:text-[var(--color-sr-navy-deeper)]"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="ml-2 text-[12px] font-semibold tabular-nums tracking-[0.14em] text-white/60">
                {String(index + 1).padStart(2, '0')}
                <span className="mx-1 text-white/35">/</span>
                {String(len).padStart(2, '0')}
              </p>
            </div>

            <div
              className="flex min-w-0 flex-1 items-center gap-1.5"
              role="tablist"
              aria-label="Slide indicators"
            >
              {SLIDES.map((slide, i) => (
                <button
                  key={slide.src}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Show slide ${i + 1}: ${slide.label}`}
                  onClick={() => goTo(i, i > index ? 'next' : 'prev')}
                  className={[
                    'h-1 flex-1 transition-colors duration-300',
                    i === index
                      ? 'bg-[var(--color-sr-yellow)]'
                      : 'bg-white/30 hover:bg-white/55',
                  ].join(' ')}
                />
              ))}
            </div>

            <p className="hidden text-[12px] font-semibold uppercase tracking-[0.16em] text-white/55 sm:block">
              {active.label}
            </p>
          </div>
        </div>
      </div>

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
