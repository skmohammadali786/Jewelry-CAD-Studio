import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useContent } from "../hooks/use-content";

gsap.registerPlugin(ScrollTrigger);

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
  const { about } = useContent();
  const sectionRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      gsap.fromTo(eyebrowRef.current,
        { opacity: 0, y: 30, letterSpacing: "8px" },
        {
          opacity: 1, y: 0, letterSpacing: "4px",
          duration: 1.2, ease: "power4.out",
          scrollTrigger: { trigger: eyebrowRef.current, start: "top 85%", once: true }
        }
      );

      if (titleRef.current) {
        const words = titleRef.current.querySelectorAll(".word");
        gsap.fromTo(words,
          { opacity: 0, y: 80, rotateX: -40 },
          {
            opacity: 1, y: 0, rotateX: 0,
            duration: 1, stagger: 0.15, ease: "power4.out",
            scrollTrigger: { trigger: titleRef.current, start: "top 82%", once: true }
          }
        );
      }

      gsap.fromTo(dividerRef.current,
        { scaleX: 0, transformOrigin: "left" },
        {
          scaleX: 1, duration: 1.2, ease: "power3.inOut",
          scrollTrigger: { trigger: dividerRef.current, start: "top 85%", once: true }
        }
      );

      gsap.fromTo(".about-text-col",
        { opacity: 0, x: -100, skewY: 2 },
        {
          opacity: 1, x: 0, skewY: 0,
          duration: 1.3, ease: "power4.out",
          scrollTrigger: { trigger: ".about-text-col", start: "top 80%", once: true }
        }
      );

      gsap.fromTo(".about-paragraph",
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0,
          duration: 0.9, stagger: 0.18, ease: "power3.out",
          scrollTrigger: { trigger: ".about-text-col", start: "top 75%", once: true }
        }
      );

      gsap.fromTo(".about-signature",
        { opacity: 0, x: -40 },
        {
          opacity: 1, x: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: ".about-signature", start: "top 88%", once: true }
        }
      );

      gsap.fromTo(".about-image-col",
        { opacity: 0, scale: 0.9, x: 80 },
        {
          opacity: 1, scale: 1, x: 0,
          duration: 1.3, ease: "power4.out",
          scrollTrigger: { trigger: ".about-image-col", start: "top 78%", once: true }
        }
      );

      gsap.fromTo(".about-floating-badge",
        { opacity: 0, scale: 0.5, rotation: -8 },
        {
          opacity: 1, scale: 1, rotation: 0,
          duration: 0.9, ease: "back.out(1.7)",
          scrollTrigger: { trigger: ".about-floating-badge", start: "top 90%", once: true }
        }
      );

      if (statsRef.current) {
        gsap.fromTo(statsRef.current.querySelectorAll(".about-stat"),
          { opacity: 0, y: 60, scale: 0.85 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.8, stagger: 0.15, ease: "back.out(1.4)",
            scrollTrigger: { trigger: statsRef.current, start: "top 80%", once: true }
          }
        );

        statsRef.current.querySelectorAll(".about-stat-value").forEach((el) => {
          const raw = (el as HTMLElement).textContent || "";
          const numStr = raw.replace(/[^0-9]/g, "");
          const suffix = raw.replace(numStr, "");
          const target = parseInt(numStr, 10);
          if (!isNaN(target)) {
            const obj = { val: 0 };
            gsap.to(obj, {
              val: target,
              duration: 2,
              ease: "power2.out",
              onUpdate() {
                (el as HTMLElement).textContent = Math.round(obj.val) + suffix;
              },
              scrollTrigger: { trigger: statsRef.current, start: "top 80%", once: true }
            });
          }
        });
      }

      if (capRef.current) {
        gsap.fromTo(capRef.current.querySelectorAll(".cap-card"),
          { opacity: 0, y: 80, scale: 0.88, rotateX: 15 },
          {
            opacity: 1, y: 0, scale: 1, rotateX: 0,
            duration: 0.85, stagger: { amount: 0.6, from: "start" },
            ease: "power3.out",
            scrollTrigger: { trigger: capRef.current, start: "top 78%", once: true }
          }
        );
      }

      gsap.to(".about-main-img",
        {
          yPercent: -12,
          ease: "none",
          scrollTrigger: {
            trigger: ".about-image-col",
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          }
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" className="about-section" ref={sectionRef}>
      <div className="about-gold-line" />

      <div style={{ textAlign: "center", marginBottom: "80px" }}>
        <span className="section-eyebrow" ref={eyebrowRef}>{about.eyebrow}</span>
        <h2 className="section-title" ref={titleRef} style={{ perspective: "800px" }}>
          {about.heading.split(" ").map((word, i, arr) => (
            <span key={i} className="word" style={{
              display: "inline-block",
              color: i >= Math.floor(arr.length / 2) ? "var(--gold)" : undefined,
              fontStyle: i >= Math.floor(arr.length / 2) ? "italic" : undefined,
              marginRight: i < arr.length - 1 ? "0.3em" : 0,
            }}>{word}</span>
          ))}
        </h2>
        <div className="section-divider" ref={dividerRef} style={{ margin: "24px auto 0" }} />
      </div>

      <div className="about-split">
        <div className="about-text-col">
          {about.paragraphs.map((para, i) => (
            <p key={i} className="about-paragraph">{para}</p>
          ))}

          <div className="about-signature">
            <div className="about-sig-line" />
            <div>
              <p className="about-sig-name">{about.signerName}</p>
              <p className="about-sig-title">{about.signerTitle}</p>
            </div>
          </div>
        </div>

        <div className="about-image-col">
          <div className="about-image-frame">
            <img src="/assets/images/AJ-002.jpg" alt="Jewelry CAD Design process" className="about-main-img" />
            <div className="about-img-overlay" />
            <div className="about-floating-badge">
              <span className="about-badge-num">
                {about.stats.find(s => s.label.toLowerCase().includes("design"))?.value ?? "500+"}
              </span>
              <span className="about-badge-label">Designs Delivered</span>
            </div>
          </div>
          <div className="about-image-secondary">
            <img src="/assets/images/AJ-005.jpg" alt="Precision jewelry rendering" />
            <div className="about-img-overlay" />
          </div>
        </div>
      </div>

      <div className="about-stats" ref={statsRef}>
        {about.stats.map((stat) => (
          <div key={stat.label} className="about-stat">
            <span className="about-stat-value">{stat.value}</span>
            <span className="about-stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

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
