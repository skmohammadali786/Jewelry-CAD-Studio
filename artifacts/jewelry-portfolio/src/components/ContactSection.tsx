import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const WHATSAPP_NUMBER = "+918016654314";
const EMAIL = "skamirulcad8016@gmail.com";

export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current?.querySelectorAll(".fade-up"), {
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          once: true,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const openWhatsApp = () => {
    const message = "Hello! I am interested in custom CAD jewelry design services. Can you please share more details?";
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="contact" className="contact-section" ref={sectionRef}>
      <div className="contact-inner">
        <span className="section-eyebrow fade-up">Get In Touch</span>
        <h2 className="section-title fade-up">Commission a Design</h2>
        <div className="section-divider fade-up" style={{ margin: "0 auto 40px" }} />
        <p className="contact-text fade-up">
          Custom CAD designs available on request. Whether you have a concept sketch
          or just an idea in mind, we transform your vision into a precision 3D model
          ready for production. Specializing in rings, necklaces, earrings, bracelets,
          and bespoke jewelry collections.
        </p>

        {/* Contact Info Cards */}
        <div className="contact-info-cards fade-up">
          <div className="contact-info-card" onClick={openWhatsApp} style={{ cursor: "none" }}>
            <div className="contact-info-icon">
              <WhatsAppIcon />
            </div>
            <div>
              <p className="contact-info-label">WhatsApp</p>
              <p className="contact-info-value">+91 8016654314</p>
            </div>
          </div>
          <div className="contact-info-card">
            <div className="contact-info-icon">
              <EmailIcon />
            </div>
            <div>
              <p className="contact-info-label">Email</p>
              <a href={`mailto:${EMAIL}`} className="contact-info-value">{EMAIL}</a>
            </div>
          </div>
          <div className="contact-info-card">
            <div className="contact-info-icon">
              <LocationIcon />
            </div>
            <div>
              <p className="contact-info-label">Location</p>
              <p className="contact-info-value">Newtown, Kolkata, WB 700135</p>
            </div>
          </div>
        </div>

        <div className="contact-actions fade-up">
          <button className="btn-primary" onClick={openWhatsApp}>
            <WhatsAppIcon />
            Order via WhatsApp
          </button>
          <a href={`mailto:${EMAIL}`} className="btn-secondary">
            <EmailIcon />
            Email Us
          </a>
        </div>
      </div>
    </section>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}
