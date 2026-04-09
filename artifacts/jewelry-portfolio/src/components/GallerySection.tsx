import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { designs, type Design } from "../data/designs";
import { DesignModal } from "./DesignModal";

gsap.registerPlugin(ScrollTrigger);

export function GallerySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.from(headerRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 80%",
          once: true,
        },
      });

      // Gallery items stagger
      const items = gridRef.current?.querySelectorAll(".gallery-item");
      if (items) {
        gsap.from(items, {
          opacity: 0,
          y: 60,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 80%",
            once: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="designs" className="gallery-section" ref={sectionRef}>
      <div className="gallery-header" ref={headerRef}>
        <span className="section-eyebrow">Portfolio</span>
        <h2 className="section-title">Design Gallery</h2>
        <div className="section-divider" />
        <p style={{ color: "var(--gray-dim)", fontSize: "15px", maxWidth: "500px", margin: "0 auto", lineHeight: 1.8 }}>
          Each design is precision-crafted using industry-leading CAD software,
          delivering files ready for 3D printing, casting, and production.
        </p>
      </div>

      <div className="gallery-grid" ref={gridRef}>
        {designs.map((design) => (
          <GalleryItem
            key={design.code}
            design={design}
            onClick={() => setSelectedDesign(design)}
          />
        ))}
      </div>

      <DesignModal
        design={selectedDesign}
        onClose={() => setSelectedDesign(null)}
      />
    </section>
  );
}

function GalleryItem({ design, onClick }: { design: Design; onClick: () => void }) {
  return (
    <div className="gallery-item" onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onClick()}>
      <img
        src={design.image}
        alt={design.name}
        loading="lazy"
      />
      <div className="gallery-overlay">
        <p className="gallery-item-code">{design.code}</p>
        <h3 className="gallery-item-name">{design.name}</h3>
        <p className="gallery-item-cta">View Details</p>
      </div>
      <div className="gold-badge">{design.code}</div>
    </div>
  );
}
