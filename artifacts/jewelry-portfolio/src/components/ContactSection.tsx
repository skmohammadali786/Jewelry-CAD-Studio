import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useContent } from "../hooks/use-content";

gsap.registerPlugin(ScrollTrigger);

export function ContactSection() {
  const { contact } = useContent();
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const whatsappUrl = (msg: string) =>
    `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;

  const defaultMsg = "Hello! I am interested in custom CAD jewelry design services. Can you please share more details?";

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          once: true,
        },
      });

      tl.fromTo(
        leftRef.current,
        { opacity: 0, x: -80, skewX: -3 },
        { opacity: 1, x: 0, skewX: 0, duration: 1.1, ease: "power4.out" },
        0
      );

      tl.fromTo(
        rightRef.current,
        { opacity: 0, x: 80, skewX: 3 },
        { opacity: 1, x: 0, skewX: 0, duration: 1.1, ease: "power4.out" },
        0
      );

      if (cardsRef.current) {
        tl.fromTo(
          cardsRef.current.querySelectorAll(".cinfo-card"),
          { opacity: 0, y: 50, scale: 0.92 },
          { opacity: 1, y: 0, scale: 1, duration: 0.75, stagger: 0.14, ease: "back.out(1.4)" },
          0.3
        );
      }

      gsap.to(".contact-orb", {
        y: -60,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const contactCards = [
    {
      icon: <WhatsAppIcon />,
      label: "WhatsApp",
      value: contact.whatsapp,
      sub: "Click to open chat",
      action: () => window.open(whatsappUrl(defaultMsg), "_blank", "noopener,noreferrer"),
      accent: "#25D366",
      href: undefined,
    },
    {
      icon: <EmailIcon />,
      label: "Email",
      value: contact.email,
      sub: "We reply within 24 hours",
      action: undefined,
      accent: "#C9A84C",
      href: `mailto:${contact.email}`,
    },
    {
      icon: <LocationIcon />,
      label: "Studio Location",
      value: contact.address.split(",")[0] ?? contact.address,
      sub: contact.address.split(",").slice(1).join(",").trim() || "India",
      action: undefined,
      accent: "#C9A84C",
      href: undefined,
    },
  ];

  return (
    <section id="contact" className="contact-section" ref={sectionRef}>
      <div className="contact-orb contact-orb--1" />
      <div className="contact-orb contact-orb--2" />
      <div className="contact-top-line" />

      <div className="contact-layout">

        {/* ── LEFT COLUMN ─────────────────────── */}
        <div className="contact-left" ref={leftRef}>
          <span className="section-eyebrow">Commission a Design</span>
          <h2 className="contact-heading">
            Let's Create<br />
            <em className="contact-heading-em">Something<br />Beautiful</em>
          </h2>
          <div className="section-divider" style={{ margin: "32px 0" }} />
          <p className="contact-body">
            Whether you have a sketch, an idea, or a finished concept — we transform
            it into a precision 3D CAD model ready for casting, printing, or production.
            Specialising in rings, necklaces, earrings, bracelets, and bespoke collections.
          </p>

          <div className="cinfo-cards" ref={cardsRef}>
            {contactCards.map((card) => {
              const inner = (
                <div
                  className="cinfo-card"
                  style={{ "--card-accent": card.accent } as React.CSSProperties}
                  onClick={card.action}
                >
                  <div className="cinfo-icon" style={{ color: card.accent, borderColor: card.accent + "44" }}>
                    {card.icon}
                  </div>
                  <div className="cinfo-text">
                    <span className="cinfo-label">{card.label}</span>
                    <strong className="cinfo-value">{card.value}</strong>
                    <span className="cinfo-sub">{card.sub}</span>
                  </div>
                  <div className="cinfo-arrow">›</div>
                </div>
              );
              return card.href
                ? <a href={card.href} key={card.label} className="cinfo-link">{inner}</a>
                : <div key={card.label} className="cinfo-link">{inner}</div>;
            })}
          </div>
        </div>

        {/* ── RIGHT PANEL — ENHANCED READY TO ORDER ──── */}
        <div className="contact-right" ref={rightRef}>
          <div className="rto-card">

            {/* Animated background elements */}
            <div className="rto-bg-glow" />
            <div className="rto-diamond-watermark">
              <DiamondWatermarkIcon />
            </div>
            <div className="rto-particles">
              {[...Array(6)].map((_, i) => (
                <span key={i} className={`rto-particle rto-particle--${i + 1}`} />
              ))}
            </div>

            <div className="rto-inner">

              {/* Live indicator */}
              <div className="rto-live-badge">
                <span className="rto-live-dot" />
                <span>Available Now · Quick Response</span>
              </div>

              {/* Main heading */}
              <div className="rto-headline-wrap">
                <p className="rto-eyebrow">Ready to Order?</p>
                <h3 className="rto-heading">
                  Start Your<br />
                  <span className="rto-heading-gold">Custom Design</span>
                </h3>
              </div>

              {/* Stats row */}
              <div className="rto-stats">
                {[
                  { value: "500+", label: "Designs" },
                  { value: "48h", label: "Turnaround" },
                  { value: "100%", label: "Satisfaction" },
                ].map((s) => (
                  <div key={s.label} className="rto-stat">
                    <span className="rto-stat-value">{s.value}</span>
                    <span className="rto-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>

              <div className="rto-divider" />

              {/* WhatsApp CTA */}
              <button
                className="rto-wa-btn"
                onClick={() => window.open(whatsappUrl(defaultMsg), "_blank", "noopener,noreferrer")}
              >
                <span className="rto-wa-icon"><WhatsAppBigIcon /></span>
                <span className="rto-wa-text">
                  <span className="rto-wa-main">Order via WhatsApp</span>
                  <span className="rto-wa-sub">{contact.whatsapp}</span>
                </span>
                <span className="rto-wa-arrow">→</span>
              </button>

              {/* Email CTA */}
              <a href={`mailto:${contact.email}`} className="rto-email-btn">
                <EmailIcon />
                <span>{contact.email}</span>
              </a>

              <div className="rto-divider" />

              {/* How it works */}
              <p className="rto-steps-label">How it works</p>
              <div className="rto-steps">
                {[
                  { n: "01", text: "Share your sketch or idea" },
                  { n: "02", text: "Receive 3D CAD preview in 48h" },
                  { n: "03", text: "Approve & get production files" },
                ].map((step) => (
                  <div key={step.n} className="rto-step">
                    <span className="rto-step-num">{step.n}</span>
                    <span className="rto-step-text">{step.text}</span>
                  </div>
                ))}
              </div>

              {/* Guarantee badge */}
              <div className="rto-guarantee">
                <ShieldIcon />
                <span>100% Satisfaction Guarantee — Revisions included</span>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function WhatsAppBigIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 7 10-7" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function DiamondWatermarkIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.8">
      <path d="M50 5L95 35L95 65L50 95L5 65L5 35Z" />
      <path d="M50 5L5 35L50 50L95 35Z" />
      <path d="M5 65L50 50L95 65L50 95Z" />
      <path d="M50 5L50 95M5 35L95 35M5 65L95 65" />
      <path d="M5 35L50 50M95 35L50 50M5 65L50 50M95 65L50 50" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}
