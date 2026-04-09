import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { HeroCanvas } from "./HeroCanvas";

export function HeroSection() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 1.9 });

      tl.to(".hero-logo", { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, 0)
        .to(".hero-eyebrow", { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, 0.15)
        .to(".hero-title", { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, 0.3)
        .to(".hero-subtitle", { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, 0.5)
        .to(".hero-cta", { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, 0.65);
    }, contentRef);

    return () => ctx.revert();
  }, []);

  const scrollToDesigns = () => {
    const el = document.getElementById("designs");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="hero">
      <HeroCanvas />
      <div className="hero-overlay" />

      <div className="hero-content" ref={contentRef}>
        <img
          src="/assets/logo.png"
          alt="Amirul Jewelry CAD Studio"
          className="hero-logo"
          style={{ transform: "translateY(20px)" }}
        />
        <p className="hero-eyebrow" style={{ transform: "translateY(20px)" }}>
          Premium Jewelry CAD Design
        </p>
        <h1 className="hero-title" style={{ transform: "translateY(20px)" }}>
          Amirul <span>Jewelry</span>
          <br />
          CAD Studio
        </h1>
        <p className="hero-subtitle" style={{ transform: "translateY(20px)" }}>
          Precision CAD Designs for Modern Jewelry
        </p>
        <button className="hero-cta" onClick={scrollToDesigns} style={{ transform: "translateY(20px)" }}>
          <DiamondIcon />
          Explore Designs
        </button>
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
      <path d="m12 22-4-13h8" />
    </svg>
  );
}
