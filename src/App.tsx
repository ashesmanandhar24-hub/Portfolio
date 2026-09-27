import { useCallback, useEffect, useRef, useState } from 'react';

const VIDEO_URL = './mainframe-hero.mp4';
const SENSITIVITY = 0.8;
const EMAIL = 'ashesmanandhar24@gmail.com';
const TYPEWRITER_TEXT =
  'Your business has a story. I turn it into scroll-stopping content.';
const TIKTOK_VIDEOS = [
  '7674997162719120658',
  '7686320066710818056',
  '7680946648763206930',
  '7671946525643230482',
  '7670507909394091271',
];

function tiktokPlayerUrl(videoId: string, preview = false, autoplay = false) {
  const params = new URLSearchParams({
    controls: preview ? '0' : '1',
    play_button: preview ? '0' : '1',
    volume_control: preview ? '0' : '1',
    description: '0',
    music_info: '0',
    autoplay: preview ? (autoplay ? '1' : '0') : '1',
    muted: preview ? '1' : '0',
  });
  return `https://www.tiktok.com/player/v1/${videoId}?${params.toString()}`;
}

const navLinks = [
  { label: 'Home', href: '#top' },
  { label: 'About', href: '#about' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Services', href: '#services' },
  { label: 'Review', href: '#review' },
  { label: 'Contact', href: '#contact' },
];

function useTypewriter(text: string, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let index = 0;
    let interval: number | undefined;
    const delay = window.setTimeout(() => {
      interval = window.setInterval(() => {
        index += 1;
        setDisplayed(text.slice(0, index));

        if (index >= text.length) {
          if (interval !== undefined) window.clearInterval(interval);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      window.clearTimeout(delay);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [speed, startDelay, text]);

  return { displayed, done };
}

function AnimatedNumber({
  target,
  suffix = '',
  started,
}: {
  target: number;
  suffix?: string;
  started: boolean;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!started) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }

    const duration = 1867;
    const startTime = performance.now();
    let frameId = 0;
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * easedProgress));
      if (progress < 1) frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, [started, target]);

  return <>{value.toLocaleString()}{suffix && <span className="analytics-suffix">{suffix}</span>}</>;
}

function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <div className={`social-links ${className}`} role="group" aria-label="Social media">
      <a
        className="social-link"
        href="https://www.facebook.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook (opens in a new tab)"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.3 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.5 1.6-1.5h1.7V3.1c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.4H7.4v3.2h2.7V21h3.2Z" />
        </svg>
      </a>
      <a
        className="social-link"
        href="https://www.instagram.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram (opens in a new tab)"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
          <circle cx="17.5" cy="6.8" r="1.1" fill="currentColor" />
        </svg>
      </a>
      <a
        className="social-link"
        href="https://www.tiktok.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="TikTok (opens in a new tab)"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.6 6.7a4.8 4.8 0 0 1-3.8-4.7h-3.5v13.2a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V8.8a6.4 6.4 0 1 0 5.6 6.4V8.6a8.3 8.3 0 0 0 4.9 1.6V6.7a4.5 4.5 0 0 1-1.2 0Z" />
        </svg>
      </a>
    </div>
  );
}

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const previousX = useRef<number | null>(null);
  const targetTime = useRef(0);
  const isSeeking = useRef(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const activeCarouselIndex = useRef(0);
  const pointerStartX = useRef<number | null>(null);
  const suppressCardClick = useRef(false);
  const edgeJumpTimer = useRef<number | undefined>(undefined);
  const analyticsRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [edgeJumpDirection, setEdgeJumpDirection] = useState<-1 | 1 | null>(null);
  const [analyticsStarted, setAnalyticsStarted] = useState(false);
  const { displayed, done } = useTypewriter(TYPEWRITER_TEXT);

  const stepCarousel = useCallback((direction: -1 | 1) => {
    const previousIndex = activeCarouselIndex.current;
    const nextIndex = (previousIndex + direction + TIKTOK_VIDEOS.length) % TIKTOK_VIDEOS.length;
    const wrapped = direction > 0 ? previousIndex === TIKTOK_VIDEOS.length - 1 : previousIndex === 0;

    activeCarouselIndex.current = nextIndex;
    setActiveVideoIndex(nextIndex);
    window.clearTimeout(edgeJumpTimer.current);
    setEdgeJumpDirection(wrapped ? direction : null);
    if (wrapped) {
      edgeJumpTimer.current = window.setTimeout(() => setEdgeJumpDirection(null), 500);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const seekToTarget = () => {
      if (isSeeking.current || video.readyState < HTMLMediaElement.HAVE_METADATA) {
        return;
      }

      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;

      const target = Math.max(0, Math.min(targetTime.current, duration));
      targetTime.current = target;
      if (Math.abs(video.currentTime - target) < 0.01) return;

      isSeeking.current = true;
      try {
        video.currentTime = target;
      } catch {
        isSeeking.current = false;
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (previousX.current === null) {
        previousX.current = event.clientX;
        return;
      }

      const delta = previousX.current - event.clientX;
      previousX.current = event.clientX;

      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;

      const currentTarget = isSeeking.current ? targetTime.current : video.currentTime;
      const timeOffset = (delta / window.innerWidth) * SENSITIVITY * duration;
      targetTime.current = Math.max(0, Math.min(currentTarget + timeOffset, duration));
      seekToTarget();
    };

    const handleSeeked = () => {
      isSeeking.current = false;
      if (Math.abs(video.currentTime - targetTime.current) >= 0.01) {
        seekToTarget();
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    video.addEventListener('seeked', handleSeeked);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!activeVideoId) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveVideoId(null);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeVideoId]);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    let accumulatedDelta = 0;
    let resetTimer = 0;
    const handleWheel = (event: WheelEvent) => {
      const carouselBounds = carousel.getBoundingClientRect();
      const carouselCenterX = (carouselBounds.left + carouselBounds.right) / 2;
      const centerCards = Array.from(carousel.querySelectorAll<HTMLElement>('.video-card'))
        .map((card) => card.getBoundingClientRect())
        .sort((a, b) => {
          const aCenter = (a.left + a.right) / 2;
          const bCenter = (b.left + b.right) / 2;
          return Math.abs(aCenter - carouselCenterX) - Math.abs(bCenter - carouselCenterX);
        })
        .slice(0, 3);
      const zoneLeft = Math.max(carouselBounds.left, Math.min(...centerCards.map((bounds) => bounds.left)));
      const zoneRight = Math.min(carouselBounds.right, Math.max(...centerCards.map((bounds) => bounds.right)));
      const zoneTop = Math.max(carouselBounds.top, Math.min(...centerCards.map((bounds) => bounds.top)));
      const zoneBottom = Math.min(carouselBounds.bottom, Math.max(...centerCards.map((bounds) => bounds.bottom)));
      const pointerInsideCenterCards = event.clientX >= zoneLeft
        && event.clientX <= zoneRight
        && event.clientY >= zoneTop
        && event.clientY <= zoneBottom;

      if (!pointerInsideCenterCards) {
        accumulatedDelta = 0;
        window.clearTimeout(resetTimer);
        return;
      }

      event.preventDefault();
      const rawDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? carousel.clientHeight
          : 1;
      const delta = rawDelta * unit;
      accumulatedDelta += delta;

      if (Math.abs(accumulatedDelta) >= 200) {
        stepCarousel(accumulatedDelta > 0 ? 1 : -1);
        accumulatedDelta = 0;
      }

      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        accumulatedDelta = 0;
      }, 140);
    };

    carousel.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      carousel.removeEventListener('wheel', handleWheel);
      window.clearTimeout(resetTimer);
    };
  }, [stepCarousel]);

  useEffect(() => {
    const analytics = analyticsRef.current;
    if (!analytics) return;
    if (!('IntersectionObserver' in window)) {
      setAnalyticsStarted(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setAnalyticsStarted(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });

    observer.observe(analytics);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        className="background-video fixed inset-0 z-0 h-full w-full object-cover"
        src={VIDEO_URL}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
      />

      <div
        className={`mobile-menu fixed inset-0 z-[9] flex items-center px-8 backdrop-blur-sm ${menuOpen ? 'mobile-menu-open' : ''}`}
        aria-hidden={!menuOpen}
        style={{
          pointerEvents: menuOpen ? 'auto' : 'none',
          visibility: menuOpen ? 'visible' : 'hidden',
        }}
      >
        <nav id="mobile-navigation" aria-label="Main navigation" className="mobile-menu-links">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>
        <SocialLinks className="mobile-social-links" />
      </div>

      <header className="site-header">
        <a className="brand inline-flex items-center gap-3" href="#top" aria-label="Ashes home">
          <span className="brand-wordmark">Ashes</span>
          <span className="brand-asterisk" aria-hidden="true">
            ✳︎
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href}>{link.label}</a>
          ))}
        </nav>

        <SocialLinks className="header-social-links" />

        <button
          className={`menu-toggle ${menuOpen ? 'menu-toggle-open' : ''}`}
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <main className="page-main">
        <section
          id="top"
          className="hero flex h-screen flex-col justify-end overflow-hidden px-5 pb-12 md:justify-center md:px-10 md:pb-0"
          aria-label="Ashes home"
        >
          <div className="video-watermark-cover">
            <a href="tel:9803818999" aria-label="Call 9803818999">9803818999</a>
            <span aria-hidden="true">/</span>
            <a href="tel:9767233474" aria-label="Call 9767233474">9767233474</a>
          </div>
          <div className="hero-content relative z-10 max-w-xl">
            <p className="typewriter-text mb-5 font-normal text-white sm:mb-6" aria-label={TYPEWRITER_TEXT}>
              <span aria-hidden="true">{displayed}</span>
              {!done && <span className="typewriter-cursor" aria-hidden="true" />}
            </p>
          </div>
        </section>

        <section id="about" className="content-section about-section" aria-labelledby="about-title">
          <div className="section-shell about-layout">
            <div className="section-heading-block">
              <p className="section-eyebrow">01 / About</p>
              <h2 id="about-title">Every business has a story worth stopping for.</h2>
            </div>
            <div className="about-copy">
              <p>
                I help businesses find the heart of their story and turn it into thoughtful,
                scroll-stopping content made for the people they want to reach.
              </p>
              <p>
                From the first idea to the final edit, Ashes brings strategy, storytelling, and
                visual craft together in one clear voice.
              </p>
              <a className="text-link" href="#portfolio">
                Explore the portfolio <span aria-hidden="true">↘</span>
              </a>
            </div>
          </div>
        </section>

        <section id="analytics" className="content-section analytics-section" aria-labelledby="analytics-title">
          <div className="section-shell analytics-shell" ref={analyticsRef}>
            <div className="section-intro analytics-intro">
              <div>
                <p className="section-eyebrow">02 / Analytics</p>
                <h2 id="analytics-title">Good stories make an impact.</h2>
              </div>
              <p className="section-intro-note">A snapshot of the work and the people behind it.</p>
            </div>
            <div className="analytics-grid">
              <article className="analytics-stat">
                <strong className="analytics-value"><AnimatedNumber target={30} started={analyticsStarted} /></strong>
                <h3>Completed projects</h3>
              </article>
              <article className="analytics-stat">
                <strong className="analytics-value"><AnimatedNumber target={8} started={analyticsStarted} /></strong>
                <h3>Happy clients</h3>
              </article>
              <article className="analytics-stat">
                <strong className="analytics-value"><AnimatedNumber target={100} suffix="k" started={analyticsStarted} /></strong>
                <h3>Total views reached</h3>
              </article>
              <article className="analytics-stat">
                <strong className="analytics-value"><AnimatedNumber target={100} suffix="%" started={analyticsStarted} /></strong>
                <h3>Client satisfaction</h3>
              </article>
            </div>
          </div>
        </section>

        <section id="portfolio" className="content-section portfolio-section" aria-labelledby="portfolio-title">
          <div className="section-shell">
            <div className="section-intro">
              <div>
                <p className="section-eyebrow">03 / Portfolio</p>
                <h2 id="portfolio-title">Stories, shaped to stand out.</h2>
              </div>
              <div className="portfolio-heading-side">
                <p className="section-intro-note">A few moments from Keshora Salon.</p>
                <div className="carousel-controls" role="group" aria-label="Portfolio carousel controls">
                  <button type="button" aria-label="Previous videos" onClick={() => stepCarousel(-1)}>←</button>
                  <button type="button" aria-label="Next videos" onClick={() => stepCarousel(1)}>→</button>
                </div>
              </div>
            </div>
            <div
              className="video-carousel"
              ref={carouselRef}
              role="region"
              aria-roledescription="carousel"
              aria-label="Keshora Salon TikTok videos"
              onPointerDown={(event) => {
                pointerStartX.current = event.clientX;
              }}
              onPointerUp={(event) => {
                if (pointerStartX.current === null) return;
                const delta = event.clientX - pointerStartX.current;
                pointerStartX.current = null;
                if (Math.abs(delta) > 40) {
                  suppressCardClick.current = true;
                  stepCarousel(delta < 0 ? 1 : -1);
                  window.setTimeout(() => {
                    suppressCardClick.current = false;
                  }, 500);
                }
              }}
              onPointerCancel={() => {
                pointerStartX.current = null;
              }}
            >
              {TIKTOK_VIDEOS.map((videoId, index) => {
                const halfCount = Math.floor(TIKTOK_VIDEOS.length / 2);
                const relativePosition = ((index - activeVideoIndex + TIKTOK_VIDEOS.length + halfCount) % TIKTOK_VIDEOS.length) - halfCount;
                const distance = Math.abs(relativePosition);
                const isActive = index === activeVideoIndex;
                const isPlayingInline = isActive && !activeVideoId;
                const scale = distance === 0 ? 1 : distance === 1 ? 0.82 : 0.66;
                const teleportsAcrossLoop = (edgeJumpDirection === 1 && relativePosition === halfCount)
                  || (edgeJumpDirection === -1 && relativePosition === -halfCount);

                return (
                  <article
                    className={`video-card ${isActive ? 'video-card-active' : ''}`}
                    key={videoId}
                    aria-current={isActive ? 'true' : undefined}
                    style={{
                      zIndex: TIKTOK_VIDEOS.length - distance,
                      opacity: distance === 2 ? 0.56 : distance === 1 ? 0.82 : 1,
                      transform: `translate(calc(-50% + ${relativePosition * 115}%), -50%) scale(${scale})`,
                      transition: teleportsAcrossLoop ? 'none' : undefined,
                    }}
                  >
                    <iframe
                      className="video-card-preview"
                      src={tiktokPlayerUrl(videoId, true, isPlayingInline)}
                      title={`TikTok video ${index + 1} from Keshora Salon`}
                      loading="lazy"
                      allow="autoplay; encrypted-media; fullscreen"
                      tabIndex={-1}
                    />
                    <button
                      className="video-card-button"
                      type="button"
                      onClick={() => {
                        if (suppressCardClick.current) {
                          suppressCardClick.current = false;
                          return;
                        }
                        setActiveVideoId(videoId);
                      }}
                      aria-label={`Open Keshora Salon TikTok video ${index + 1}`}
                    >
                      <span className="video-card-kicker">TIKTOK <span aria-hidden="true">↗</span></span>
                      <span className="video-card-play" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l10-6.5-10-6.5Z" /></svg>
                      </span>
                      <span className="video-card-caption">
                        <strong>@keshora.salon</strong>
                        <small>VIDEO 0{index + 1}</small>
                      </span>
                    </button>
                  </article>
                );
              })}
            </div>
            <p className="carousel-hint">Scroll over the center three or swipe to explore · Select a video to watch</p>
          </div>
        </section>

        <section id="services" className="content-section services-section" aria-labelledby="services-title">
          <div className="section-shell services-layout">
            <div className="section-heading-block services-heading">
              <p className="section-eyebrow">04 / Services</p>
              <h2 id="services-title">From first thought to final frame.</h2>
              <p className="services-lede">
                The right idea, shaped for the places your people spend their time.
              </p>
            </div>
            <div className="service-list">
              <article className="service-item">
                <span className="service-number">01</span>
                <div><h3>Content strategy</h3><p>A clear direction built around your audience and goals.</p></div>
                <span className="service-arrow" aria-hidden="true">↗</span>
              </article>
              <article className="service-item">
                <span className="service-number">02</span>
                <div><h3>Creative direction</h3><p>A distinct voice and visual world for your brand.</p></div>
                <span className="service-arrow" aria-hidden="true">↗</span>
              </article>
              <article className="service-item">
                <span className="service-number">03</span>
                <div><h3>Short-form video</h3><p>Focused, memorable stories made for the feed.</p></div>
                <span className="service-arrow" aria-hidden="true">↗</span>
              </article>
              <article className="service-item">
                <span className="service-number">04</span>
                <div><h3>Editing and repurposing</h3><p>More mileage from the good ideas you already have.</p></div>
                <span className="service-arrow" aria-hidden="true">↗</span>
              </article>
            </div>
          </div>
        </section>

        <section id="review" className="content-section review-section" aria-labelledby="review-title">
          <div className="section-shell review-layout">
            <p className="section-eyebrow">05 / Review</p>
            <div className="review-copy">
              <span className="review-mark" aria-hidden="true">“</span>
              <h2 id="review-title">Good work is a conversation.</h2>
              <p>
                I care about the process as much as the finished piece. If we have worked together,
                I would love to hear what the experience was like for you.
              </p>
              <a className="text-link" href={`mailto:${EMAIL}?subject=${encodeURIComponent('A note for Ashes')}`}>
                Share your experience <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>

        <section id="team" className="content-section team-section" aria-labelledby="team-title">
          <div className="section-shell">
            <div className="section-intro">
              <div>
                <p className="section-eyebrow">06 / Meet the team</p>
                <h2 id="team-title">Meet our team.</h2>
              </div>
              <p className="section-intro-note">Two people, bringing stories to life.</p>
            </div>
            <div className="team-grid">
              <article className="team-card">
                <div className="team-portrait team-portrait-ashes" aria-hidden="true">
                  <span className="team-number">TEAM / 01</span>
                  <span className="team-initials">AM</span>
                  <span className="team-symbol">✳︎</span>
                </div>
                <div className="team-card-caption">
                  <span>01</span>
                  <h3>Ashes Manandhar</h3>
                </div>
              </article>
              <article className="team-card">
                <div className="team-portrait team-portrait-parika" aria-hidden="true">
                  <span className="team-number">TEAM / 02</span>
                  <span className="team-initials">PB</span>
                  <span className="team-symbol">✳︎</span>
                </div>
                <div className="team-card-caption">
                  <span>02</span>
                  <h3>Parika Bhandari</h3>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="contact" className="content-section contact-section" aria-labelledby="contact-title">
          <div className="section-shell contact-layout">
            <div>
              <p className="section-eyebrow">07 / Contact</p>
              <h2 id="contact-title">Have a Business to Show?</h2>
              <p className="contact-copy">Let’s make something people remember.</p>
            </div>
            <div className="contact-details">
              <a className="contact-email" href={`mailto:${EMAIL}`}>{EMAIL}</a>
              <div className="contact-phones" role="group" aria-label="Phone numbers">
                <a href="tel:9803818999">9803818999</a>
                <span aria-hidden="true">/</span>
                <a href="tel:9767233474">9767233474</a>
              </div>
              <SocialLinks className="contact-social-links" />
            </div>
          </div>
          <footer className="site-footer section-shell">
            <a href="#top" className="footer-brand">Ashes <span aria-hidden="true">✳︎</span></a>
            <span>Independent creative studio</span>
            <a href="#top" className="back-to-top">Back to top ↑</a>
          </footer>
        </section>
      </main>

      {activeVideoId && (
        <div className="video-lightbox" onClick={() => setActiveVideoId(null)}>
          <div
            className="video-lightbox-panel"
            role="dialog"
            aria-modal="true"
            aria-label="TikTok video from Keshora Salon"
            onClick={(event) => event.stopPropagation()}
          >
            <iframe
              className="video-lightbox-player"
              src={tiktokPlayerUrl(activeVideoId)}
              title="TikTok video from Keshora Salon"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen; web-share"
              allowFullScreen
            />
            <button
              className="video-lightbox-close"
              type="button"
              onClick={() => setActiveVideoId(null)}
              aria-label="Close video"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
