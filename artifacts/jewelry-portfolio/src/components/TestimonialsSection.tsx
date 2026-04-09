import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Jewelry Designer, Mumbai",
    text: "The CAD models were absolutely perfect. Every stone setting was exactly as I envisioned. Delivered in just 36 hours — I was blown away by the precision and quality.",
    stars: 5,
    initial: "P",
    color: "#C9A84C",
  },
  {
    name: "Rahul Kapoor",
    role: "Jewelry Manufacturer, Delhi",
    text: "We've been working with Amirul CAD Studio for over 2 years now. The quality and precision are unmatched in the industry. Our whole custom collection is designed here.",
    stars: 5,
    initial: "R",
    color: "#a78bfa",
  },
  {
    name: "Sarah Mitchell",
    role: "Boutique Owner, Dubai",
    text: "Amazing attention to detail and very responsive. Our bespoke engagement ring collection wouldn't exist without their incredible craftsmanship and fast turnaround.",
    stars: 5,
    initial: "S",
    color: "#34d399",
  },
  {
    name: "Aditya Patel",
    role: "Goldsmith, Surat",
    text: "I've tried many CAD services but nothing comes close to this quality. The files are production-ready, zero errors in casting. Highly recommended for professionals.",
    stars: 5,
    initial: "A",
    color: "#60a5fa",
  },
];

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".testimonial-card",
        { opacity: 0, y: 60, scale: 0.94 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.85, stagger: 0.15, ease: "power3.out",
          scrollTrigger: { trigger: ".testimonials-grid", start: "top 80%", once: true },
        }
      );
      gsap.fromTo(".testimonials-header > *",
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 82%", once: true },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="testimonials-section" ref={sectionRef}>
      <div className="testimonials-bg-glow" />
      <div className="testimonials-header">
        <span className="section-eyebrow">Client Reviews</span>
        <h2 className="section-title">Trusted by Designers<br />&amp; <em style={{ color: "var(--gold)", fontStyle: "italic" }}>Manufacturers</em></h2>
        <div className="section-divider" style={{ margin: "20px auto 8px" }} />
        <p className="testimonials-sub">Real feedback from jewelers and designers across India and the world.</p>
      </div>

      <div className="testimonials-grid">
        {TESTIMONIALS.map((t) => (
          <div key={t.name} className="testimonial-card">
            <div className="testimonial-quote-mark">"</div>
            <div className="testimonial-stars">
              {Array.from({ length: t.stars }).map((_, i) => (
                <StarIcon key={i} />
              ))}
            </div>
            <p className="testimonial-text">{t.text}</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar" style={{ background: `${t.color}22`, border: `1px solid ${t.color}55`, color: t.color }}>
                {t.initial}
              </div>
              <div>
                <p className="testimonial-name">{t.name}</p>
                <p className="testimonial-role">{t.role}</p>
              </div>
            </div>
            <div className="testimonial-accent" style={{ background: t.color }} />
          </div>
        ))}
      </div>

      <div className="testimonials-trust-row">
        <div className="trust-badge">
          <ShieldIcon />
          <span>Verified Clients</span>
        </div>
        <div className="trust-badge">
          <StarIcon />
          <span>5.0 Average Rating</span>
        </div>
        <div className="trust-badge">
          <HeartIcon />
          <span>500+ Happy Customers</span>
        </div>
      </div>
    </section>
  );
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#C9A84C" }}>
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  );
}
function ShieldIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>;
}
function HeartIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#f87171" }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
}
