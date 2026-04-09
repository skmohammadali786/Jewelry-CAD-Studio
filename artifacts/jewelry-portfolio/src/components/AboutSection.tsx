import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: "500+", label: "Designs Created" },
  { value: "8+", label: "Years Experience" },
  { value: "100%", label: "Client Satisfaction" },
  { value: "48h", label: "Average Turnaround" },
];

const capabilities = [
  {
    icon: <DiamondIcon />,
    title: "Precision CAD Modeling",
    desc: "Every curve, facet, and prong modeled to sub-millimeter accuracy using industry-leading software.",
  },
  {
    icon: <RingIcon />,
    title: "Custom Ring Design",
    desc: "Solitaires, halos, eternity bands, and bespoke engagement rings — engineered for perfect fit and beauty.",
  },
  {
    icon: <NecklaceIcon />,
    title: "Necklaces & Pendants",
    desc: "From delicate chains to bold statement pendants, crafted with anatomically correct pendant physics.",
  },
  {
    icon: <StarIcon />,
    title: "Production-Ready Files",
    desc: "STL, OBJ, and ZBrush files delivered ready for 3D printing, lost-wax casting, or CNC milling.",
  },
  {
    icon: <SparkleIcon />,
    title: "Stone Setting Design",
    desc: "Pavé, prong, bezel, channel, and invisible setting designs — every stone seat machined to spec.",
  },
  {
    icon: <PencilIcon />,
    title: "Concept to Creation",
    desc: "Sketch, photo, or just an idea — we turn any reference into a full parametric 3D CAD model.",
  },
];

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Left/right split reveal
      gsap.from(".about-text-col", {
        opacity: 0,
        x: -60,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".about-text-col", start: "top 80%", once: true },
      });
      gsap.from(".about-image-col", {
        opacity: 0,
        x: 60,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".about-image-col", start: "top 80%", once: true },
      });

      // Stats counter animation
      if (statsRef.current) {
        gsap.from(statsRef.current.querySelectorAll(".about-stat"), {
          opacity: 0,
          y: 40,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: statsRef.current, start: "top 85%", once: true },
        });
      }

      // Capability cards
      if (capRef.current) {
        gsap.from(capRef.current.querySelectorAll(".cap-card"), {
          opacity: 0,
          y: 50,
          duration: 0.75,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: capRef.current, start: "top 80%", once: true },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" className="about-section" ref={sectionRef}>
      {/* Decorative gold line */}
      <div className="about-gold-line" />

      {/* Main about split */}
      <div className="about-split">
        <div className="about-text-col">
          <span className="section-eyebrow">Our Story</span>
          <h2 className="section-title">
            Where Technology<br />
            <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Meets Artistry</span>
          </h2>
          <div className="section-divider" />

          <p className="about-paragraph">
            At <strong style={{ color: "var(--gold)" }}>Amirul Jewelry CAD Studio</strong>, we bridge the gap between traditional jewelry craftsmanship and modern digital precision. Founded in the heart of Kolkata — India's jewelry capital — we specialize in creating master-quality CAD designs that bring your most ambitious jewelry visions to life.
          </p>
          <p className="about-paragraph">
            Every design we produce is a marriage of mathematical precision and artistic sensibility. We use industry-leading parametric modeling tools to craft pieces that not only look breathtaking on screen but translate flawlessly into physical jewelry — whether cast in gold, silver, or platinum.
          </p>
          <p className="about-paragraph">
            Our clients range from independent jewelers and boutique brands to large-scale manufacturers across India and internationally. We pride ourselves on fast turnaround, transparent communication, and designs that exceed expectations every time.
          </p>

          <div className="about-signature">
            <div className="about-sig-line" />
            <div>
              <p className="about-sig-name">Amirul</p>
              <p className="about-sig-title">Lead CAD Designer & Founder</p>
            </div>
          </div>
        </div>

        <div className="about-image-col">
          <div className="about-image-frame">
            <img src="/assets/images/AJ-002.jpg" alt="Jewelry CAD Design process" className="about-main-img" />
            <div className="about-img-overlay" />
            <div className="about-floating-badge">
              <span className="about-badge-num">500+</span>
              <span className="about-badge-label">Designs Delivered</span>
            </div>
          </div>
          {/* Secondary smaller image */}
          <div className="about-image-secondary">
            <img src="/assets/images/AJ-005.jpg" alt="Precision jewelry rendering" />
            <div className="about-img-overlay" />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="about-stats" ref={statsRef}>
        {stats.map((stat) => (
          <div key={stat.label} className="about-stat">
            <span className="about-stat-value">{stat.value}</span>
            <span className="about-stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Capabilities */}
      <div className="about-capabilities">
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <span className="section-eyebrow">What We Do</span>
          <h3 className="section-title" style={{ fontSize: "clamp(26px, 3vw, 40px)" }}>Our Capabilities</h3>
        </div>
        <div className="cap-grid" ref={capRef}>
          {capabilities.map((cap) => (
            <div key={cap.title} className="cap-card">
              <div className="cap-icon">{cap.icon}</div>
              <h4 className="cap-title">{cap.title}</h4>
              <p className="cap-desc">{cap.desc}</p>
              <div className="cap-line" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DiamondIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 3h12l4 6-10 13L2 9z" /><path d="M2 9h20" /><path d="m12 22-4-13h8" /></svg>;
}
function RingIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /></svg>;
}
function NecklaceIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C6.5 2 2 6.5 2 12" /><path d="M22 12c0-5.5-4.5-10-10-10" /><path d="M12 16a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" /><path d="M2 12c1.5 3 4.5 4 10 4s8.5-1 10-4" /></svg>;
}
function StarIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>;
}
function SparkleIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>;
}
function PencilIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>;
}
