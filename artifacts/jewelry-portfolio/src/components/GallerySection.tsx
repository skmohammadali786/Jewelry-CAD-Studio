import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { designs as staticDesigns, type Design } from "../data/designs";
import { DesignModal } from "./DesignModal";

gsap.registerPlugin(ScrollTrigger);

const categoryColors: Record<string, string> = {
  Ring: "#C9A84C",
  Necklace: "#9A7A30",
  Earrings: "#E8C96D",
  Bracelet: "#B8903A",
  Pendant: "#D4AF50",
};

export function GallerySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [designs, setDesigns] = useState<Design[]>(staticDesigns);

  useEffect(() => {
    const apiBase = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
    fetch(`${apiBase}/api/designs`)
      .then((r) => r.ok ? r.json() : null)
      .then((data: unknown) => {
        if (Array.isArray(data) && data.length > 0) setDesigns(data as Design[]);
      })
      .catch(() => {});
  }, []);

  const categories = ["All", ...Array.from(new Set(designs.map((d) => d.category)))];
  const filtered = activeFilter === "All" ? designs : designs.filter((d) => d.category === activeFilter);

  useEffect(() => {
    const ctx = gsap.context(() => {

      /* Eyebrow — fade + letter-spacing collapse */
      gsap.fromTo(eyebrowRef.current,
        { opacity: 0, letterSpacing: "10px", y: 20 },
        {
          opacity: 1, letterSpacing: "4px", y: 0,
          duration: 1.3, ease: "power4.out",
          scrollTrigger: { trigger: eyebrowRef.current, start: "top 85%", once: true }
        }
      );

      /* Title — slide up with perspective flip */
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 100, rotateX: -30, transformPerspective: 800 },
        {
          opacity: 1, y: 0, rotateX: 0,
          duration: 1.1, ease: "power4.out",
          scrollTrigger: { trigger: titleRef.current, start: "top 83%", once: true }
        }
      );

      /* Divider — width grows */
      gsap.fromTo(dividerRef.current,
        { scaleX: 0, transformOrigin: "center" },
        {
          scaleX: 1, duration: 1.4, ease: "power3.inOut",
          scrollTrigger: { trigger: dividerRef.current, start: "top 85%", once: true }
        }
      );

      /* Filter pills — pop in sequentially */
      if (pillsRef.current) {
        gsap.fromTo(
          pillsRef.current.querySelectorAll(".filter-pill"),
          { opacity: 0, scale: 0.7, y: 20 },
          {
            opacity: 1, scale: 1, y: 0,
            duration: 0.6, stagger: 0.07, ease: "back.out(2)",
            scrollTrigger: { trigger: pillsRef.current, start: "top 88%", once: true }
          }
        );
      }

      /* Cards — wave reveal from bottom-left to top-right */
      const items = gridRef.current?.querySelectorAll(".gallery-card");
      if (items) {
        gsap.fromTo(items,
          { opacity: 0, y: 120, scale: 0.85, rotateY: 8 },
          {
            opacity: 1, y: 0, scale: 1, rotateY: 0,
            duration: 1, stagger: { amount: 0.9, from: "start" },
            ease: "power4.out",
            scrollTrigger: { trigger: gridRef.current, start: "top 78%", once: true }
          }
        );
      }

      /* Subtle parallax on section title */
      gsap.to(headerRef.current, {
        yPercent: -15,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "30% top",
          scrub: 1,
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="designs" className="gallery-section" ref={sectionRef}>
      <div className="gallery-header" ref={headerRef}>
        <span className="section-eyebrow" ref={eyebrowRef}>Portfolio</span>
        <h2 className="section-title" ref={titleRef}>Design Gallery</h2>
        <div className="section-divider" ref={dividerRef} />
        <p className="gallery-subtitle">
          Every piece engineered to sub-millimeter accuracy — ready for casting, printing, and production.
        </p>

        <div className="filter-pills" ref={pillsRef}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-pill ${activeFilter === cat ? "active" : ""}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="gallery-cards-grid" ref={gridRef}>
        {filtered.map((design) => (
          <GalleryCard
            key={design.code}
            design={design}
            onClick={() => setSelectedDesign(design)}
          />
        ))}
      </div>

      <DesignModal design={selectedDesign} onClose={() => setSelectedDesign(null)} />
    </section>
  );
}

function GalleryCard({ design, onClick }: { design: Design; onClick: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientY - rect.top) / rect.height - 0.5) * 14;
    const y = -((e.clientX - rect.left) / rect.width - 0.5) * 14;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  };

  const catColor = categoryColors[design.category] || "#C9A84C";

  return (
    <div
      ref={cardRef}
      className={`gallery-card ${hovered ? "hovered" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: hovered ? "transform 0.1s ease" : "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
      }}
    >
      <div className="card-glow" style={{ "--glow-color": catColor } as React.CSSProperties} />

      <div className="card-image-wrap">
        <img src={design.image} alt={design.name} loading="lazy" className="card-img" />
        <div className="card-img-shine" />
        <div className="card-category-tag" style={{ background: catColor }}>{design.category}</div>
        <div className="card-code-badge">{design.code}</div>
        <div className="card-hover-overlay">
          <div className="card-hover-content">
            <div className="card-view-btn">
              <EyeIcon />
              <span>View Details</span>
            </div>
            <div className="card-hover-meta"><span>{design.material}</span></div>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <div className="card-footer-top">
          <div>
            <p className="card-name">{design.name}</p>
            <p className="card-style">{design.style}</p>
          </div>
          <div className="card-arrow"><ArrowIcon /></div>
        </div>
        <div className="card-footer-bottom">
          <div className="card-material-pill">
            <GoldDotIcon color={catColor} />
            {design.material}
          </div>
          <button className="card-whatsapp-mini" onClick={(e) => {
            e.stopPropagation();
            const msg = `Hello! I am interested in design ${design.code} — ${design.name}. Please share more details.`;
            window.open(`https://wa.me/+918016654314?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
          }}>
            <WhatsAppMiniIcon />
            Order
          </button>
        </div>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
function GoldDotIcon({ color }: { color: string }) {
  return <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />;
}
function WhatsAppMiniIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
