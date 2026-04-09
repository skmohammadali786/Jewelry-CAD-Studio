import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { HeroCanvas } from "./HeroCanvas";
import { useContent } from "../hooks/use-content";

// Animated counter
function animateCount(el: HTMLElement, end: number, suffix: string, dur: number) {
  let start = 0;
  const step = (end / (dur / 16));
  const run = () => {
    start = Math.min(start + step, end);
    el.textContent = Math.floor(start) + suffix;
    if (start < end) requestAnimationFrame(run);
  };
  requestAnimationFrame(run);
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { hero } = useContent();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 });

      // Scanline reveal on logo
      tl.fromTo(".hero-logo",
        { opacity: 0, scale: 0.7, rotationY: -90 },
        { opacity: 1, scale: 1, rotationY: 0, duration: 1.0, ease: "back.out(1.4)" }, 0
      );

      // Eyebrow — letter spacing collapse
      tl.fromTo(".hero-eyebrow",
        { opacity: 0, letterSpacing: "16px", y: 12 },
        { opacity: 1, letterSpacing: "5px", y: 0, duration: 0.9, ease: "power4.out" }, 0.3
      );

      // Title — split by word, each word flips in
      const words = document.querySelectorAll(".hero-title-word");
      if (words.length) {
        tl.fromTo(words,
          { opacity: 0, y: 60, rotateX: -80, transformPerspective: 800 },
          { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.12, ease: "power4.out" }, 0.45
        );
      }

      // Subtitle fade
      tl.fromTo(".hero-subtitle",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.85
      );

      // CTAs pop in
      tl.fromTo(".hero-cta",
        { opacity: 0, y: 20, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.14, ease: "back.out(1.8)" }, 1.05
      );

      // Floating stats
      tl.fromTo(".hero-float-stat",
        { opacity: 0, y: 24, scale: 0.88 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: "back.out(1.6)" }, 1.2
      );

      // Gold underline grows
      tl.fromTo(".hero-title-underline",
        { scaleX: 0 },
        { scaleX: 1, duration: 0.9, ease: "power3.inOut" }, 0.95
      );

      // Shimmer line
      tl.to(".hero-shimmer", { opacity: 1, duration: 0.5 }, 1.1);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Counter animation on stats when they enter view
  useEffect(() => {
    const statDefs = [
      { cls: ".hero-stat-0", end: 400, suffix: "+" },
      { cls: ".hero-stat-1", end: 48,  suffix: "h" },
      { cls: ".hero-stat-2", end: 100, suffix: "%" },
      { cls: ".hero-stat-3", end: 6,   suffix: "+" },
    ];

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          statDefs.forEach(({ cls, end, suffix }) => {
            const el = document.querySelector(cls) as HTMLElement | null;
            if (el) animateCount(el, end, suffix, 1800);
          });
          obs.disconnect();
        }
      });
    }, { threshold: 0.4 });

    const target = document.querySelector(".hero-float-stat");
    if (target) obs.observe(target);
    return () => obs.disconnect();
  }, []);

  const scrollToDesigns = () => {
    document.getElementById("designs")?.scrollIntoView({ behavior: "smooth" });
  };

  // Split the title into words for animation
  const titleWords = (hero.title as string).split(" ");

  return (
    <section id="home" className="hero" ref={sectionRef}>
      <HeroCanvas />
      <div className="hero-overlay" />
      <div className="hero-gradient-bottom" />

      {/* Animated grid overlay */}
      <div className="hero-grid-overlay" />

      {/* Animated corner brackets */}
      <div className="hero-bracket hero-bracket--tl" />
      <div className="hero-bracket hero-bracket--tr" />
      <div className="hero-bracket hero-bracket--bl" />
      <div className="hero-bracket hero-bracket--br" />

      <div className="hero-content">
        <img
          src="/assets/logo.png"
          alt="Amirul Jewelry CAD Studio"
          className="hero-logo"
          style={{ opacity: 0 }}
        />
        <p className="hero-eyebrow" style={{ opacity: 0 }}>
          {hero.eyebrow}
        </p>

        <div className="hero-title-wrap">
          <h1 className="hero-title">
            {titleWords.map((word, i) => (
              <span key={i} className="hero-title-word" style={{ opacity: 0, display: "inline-block", marginRight: "0.28em" }}>
                {word}
              </span>
            ))}
          </h1>
          <div className="hero-title-underline" style={{ transformOrigin: "left center" }} />
        </div>

        <div className="hero-shimmer" style={{ opacity: 0 }} />

        <p className="hero-subtitle" style={{ opacity: 0 }}>
          {hero.subtitle}
        </p>

        <div className="hero-cta-row">
          <button className="hero-cta hero-cta-primary" style={{ opacity: 0 }} onClick={scrollToDesigns}>
            <DiamondIcon />
            Explore Designs
          </button>
          <a
            href="https://wa.me/+918016654314?text=Hello!%20I%20am%20interested%20in%20custom%20CAD%20jewelry%20design%20services."
            target="_blank"
            rel="noopener noreferrer"
            className="hero-cta hero-cta-wa"
            style={{ opacity: 0 }}
          >
            <WhatsAppIcon />
            WhatsApp Us
          </a>
        </div>
      </div>

      {/* Floating stat badges */}
      <div className="hero-float-stat hero-float-stat--tl" style={{ opacity: 0 }}>
        <DiamondDecorIcon />
        <span className="hero-stat-0 hero-float-val">400+</span>
        <span className="hero-float-lbl">Designs Created</span>
      </div>
      <div className="hero-float-stat hero-float-stat--tr" style={{ opacity: 0 }}>
        <DiamondDecorIcon />
        <span className="hero-stat-1 hero-float-val">48h</span>
        <span className="hero-float-lbl">Average Turnaround</span>
      </div>
      <div className="hero-float-stat hero-float-stat--bl" style={{ opacity: 0 }}>
        <DiamondDecorIcon />
        <span className="hero-stat-2 hero-float-val">100%</span>
        <span className="hero-float-lbl">Client Satisfaction</span>
      </div>
      <div className="hero-float-stat hero-float-stat--br" style={{ opacity: 0 }}>
        <DiamondDecorIcon />
        <span className="hero-stat-3 hero-float-val">6+</span>
        <span className="hero-float-lbl">Years Experience</span>
      </div>

      <div className="scroll-indicator">
        <span>Scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  );
}

function DiamondIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 3h12l4 6-10 13L2 9z" /><path d="M2 9h20" />
    </svg>
  );
}
function DiamondDecorIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--gold)", opacity: 0.8, marginBottom: "4px" }}>
      <path d="M12 2L22 9 12 22 2 9Z" />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
