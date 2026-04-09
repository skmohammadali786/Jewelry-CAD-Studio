const WHATSAPP_NUMBER = "+918016654314";
const EMAIL = "skamirulcad8016@gmail.com";

export function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-logo">
          <img src="/assets/logo.png" alt="Amirul Jewelry CAD Studio" />
          <span className="footer-logo-text">Amirul Jewelry CAD Studio</span>
        </div>
        <p className="footer-tagline">Precision CAD Designs for Modern Jewelry</p>
        <div className="footer-divider" />
        <address className="footer-address" style={{ fontStyle: "normal", textAlign: "center" }}>
          Newtown, Kolkata, West Bengal, India — 700135
          <br />
          <a href={`tel:${WHATSAPP_NUMBER}`} style={{ color: "var(--gold)", textDecoration: "none", marginTop: "6px", display: "block" }}>
            +91 8016654314
          </a>
          <a href={`mailto:${EMAIL}`} style={{ color: "var(--gray-dim)", textDecoration: "none", marginTop: "4px", display: "block", fontSize: "12px" }}>
            {EMAIL}
          </a>
        </address>
        <div className="footer-divider" />
        <div className="footer-bottom">
          <p>&copy; 2026 Amirul Jewelry CAD Studio. All rights reserved.</p>
          <div className="footer-links">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hello%2C%20I%20am%20interested%20in%20your%20jewelry%20CAD%20design%20services.`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
            <a href={`mailto:${EMAIL}`}>Email</a>
            <a href="#about">About</a>
            <a href="#designs">Designs</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
