import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { HeroCanvas } from "./HeroCanvas";
import { useContent } from "../hooks/use-content";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { hero } = useContent();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 1.9 });

      tl.to(".hero-logo",     { opacity: 1, y: 0, duration: 1,   ease: "power3.out" }, 0)
        .to(".hero-eyebrow",  { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, 0.15)
        .to(".hero-title",    { opacity: 1, y: 0, duration: 1,   ease: "power3.out" }, 0.3)
        .to(".hero-subtitle", { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, 0.5)
        .to(".hero-ctas",     { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, 0.65)
        .to(".hero-float-stat", { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: "back.out(1.6)" }, 0.85);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToDesigns = () => {
    document.getElementById("designs")?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="hero" ref={sectionRef}>
      <HeroCanvas />
      <div className="hero-overlay" />
      <div className="hero-gradient-bottom" />

      <div className="hero-content" ref={contentRef}>
        <img
          src="/assets/logo.png"
          alt="Amirul Jewelry CAD Studio"
          className="hero-logo"
          style={{ transform: "translateY(20px)" }}
        />
        <p className="hero-eyebrow" style={{ transform: "translateY(20px)" }}>
          {hero.eyebrow}
        </p>
        <h1 className="hero-title" style={{ transform: "translateY(20px)" }}>
          {hero.title}
        </h1>
        <p className="hero-subtitle" style={{ transform: "translateY(20px)" }}>
          {hero.subtitle}
        </p>

        <div className="hero-ctas" style={{ transform: "translateY(20px)", opacity: 0 }}>
          <button className="hero-cta hero-cta-primary" onClick={scrollToDesigns}>
            <DiamondIcon />
            Explore Designs
          </button>
          <a
            href="https://wa.me/+918016654314?text=Hello!%20I%20am%20interested%20in%20custom%20CAD%20jewelry%20design%20services."
            target="_blank"
            rel="noopener noreferrer"
            className="hero-cta hero-cta-wa"
            onClick={scrollToContact}
          >
            <WhatsAppIcon />
            WhatsApp Us
          </a>
        </div>
      </div>

      {/* Floating stat badges */}
      <div className="hero-float-stat hero-float-stat--tl" style={{ opacity: 0, transform: "translateY(20px) scale(0.9)" }}>
        <span className="hero-float-val">500+</span>
        <span className="hero-float-lbl">Designs Delivered</span>
      </div>
      <div className="hero-float-stat hero-float-stat--tr" style={{ opacity: 0, transform: "translateY(20px) scale(0.9)" }}>
        <span className="hero-float-val">48h</span>
        <span className="hero-float-lbl">Avg. Turnaround</span>
      </div>
      <div className="hero-float-stat hero-float-stat--bl" style={{ opacity: 0, transform: "translateY(20px) scale(0.9)" }}>
        <span className="hero-float-val">100%</span>
        <span className="hero-float-lbl">Client Satisfaction</span>
      </div>
      <div className="hero-float-stat hero-float-stat--br" style={{ opacity: 0, transform: "translateY(20px) scale(0.9)" }}>
        <span className="hero-float-val">7+</span>
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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 3h12l4 6-10 13L2 9z" />
      <path d="M2 9h20" />
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
