import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    n: "01",
    title: "Share Your Vision",
    desc: "Send us a sketch, reference photo, or simply describe your idea. We work with any format — rough sketches, inspirations, or detailed specs.",
    icon: <SketchIcon />,
    color: "#C9A84C",
  },
  {
    n: "02",
    title: "CAD Modeling",
    desc: "Our experts craft a precision 3D model with exact stone placements, prong geometry, and surface detailing — delivered as renders in 48 hours.",
    icon: <CadIcon />,
    color: "#a78bfa",
  },
  {
    n: "03",
    title: "Production Files",
    desc: "Receive industry-standard STL, OBJ, or ZBrush files ready for 3D printing, lost-wax casting, or CNC milling. Revisions included.",
    icon: <DeliverIcon />,
    color: "#34d399",
  },
];

export function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".process-step",
        { opacity: 0, y: 80, scale: 0.92 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.9, stagger: 0.18, ease: "power4.out",
          scrollTrigger: { trigger: ".process-steps", start: "top 78%", once: true },
        }
      );
      gsap.fromTo(".process-connector",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.8, stagger: 0.18, ease: "power3.inOut",
          scrollTrigger: { trigger: ".process-steps", start: "top 75%", once: true },
        }
      );
      gsap.fromTo(".process-header span, .process-header h2, .process-header p",
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 82%", once: true },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="process-section" ref={sectionRef}>
      <div className="process-bg-line" />
      <div className="process-header">
        <span className="section-eyebrow">Simple Process</span>
        <h2 className="section-title">From Vision<br />to <em style={{ color: "var(--gold)", fontStyle: "italic" }}>Reality</em></h2>
        <div className="section-divider" style={{ margin: "20px auto" }} />
        <p className="process-sub">Three steps to your perfect custom jewelry CAD design.</p>
      </div>

      <div className="process-steps">
        {STEPS.map((step, i) => (
          <div className="process-step-wrap" key={step.n}>
            <div className="process-step">
              <div className="process-step-num" style={{ color: step.color, borderColor: `${step.color}44`, background: `${step.color}10` }}>
                {step.n}
              </div>
              <div className="process-icon-wrap" style={{ color: step.color, background: `${step.color}12`, border: `1px solid ${step.color}33` }}>
                {step.icon}
              </div>
              <h3 className="process-step-title">{step.title}</h3>
              <p className="process-step-desc">{step.desc}</p>
              <div className="process-step-accent" style={{ background: step.color }} />
            </div>
            {i < STEPS.length - 1 && (
              <div className="process-connector">
                <div className="process-connector-line" />
                <div className="process-connector-arrow" style={{ color: STEPS[i].color }}>›</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="process-cta-row">
        <a
          href="https://wa.me/+918016654314?text=Hello!%20I%20want%20to%20start%20a%20custom%20CAD%20design%20project."
          target="_blank"
          rel="noopener noreferrer"
          className="process-cta-btn"
        >
          <WhatsAppIcon />
          Start Your Design Now
        </a>
        <p className="process-cta-note">Free quote · 48h turnaround · Revisions included</p>
      </div>
    </section>
  );
}

function SketchIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/><path d="m15 5 3 3"/></svg>;
}
function CadIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 9 6 6M15 9l-6 6"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/><circle cx="9" cy="15" r="1" fill="currentColor"/><circle cx="15" cy="15" r="1" fill="currentColor"/></svg>;
}
function DeliverIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M21 10V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7"/><polyline points="9 11 12 14 22 4"/></svg>;
}
function WhatsAppIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
}
