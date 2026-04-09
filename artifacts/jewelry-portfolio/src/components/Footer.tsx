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
        <address className="footer-address" style={{ fontStyle: "normal" }}>
          Newtown, Kolkata, West Bengal, India — 700135
          <br />
          <a href="tel:+918016654314" style={{ color: "var(--gold)", textDecoration: "none", marginTop: "4px", display: "block" }}>
            +91 80166 54314
          </a>
        </address>
        <div className="footer-divider" />
        <div className="footer-bottom">
          <p>&copy; 2026 Amirul Jewelry CAD Studio. All rights reserved.</p>
          <div className="footer-links">
            <a
              href="https://wa.me/+918016654314?text=Hello%2C%20I%20am%20interested%20in%20your%20jewelry%20CAD%20design%20services."
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
            <a href="#designs">Designs</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
