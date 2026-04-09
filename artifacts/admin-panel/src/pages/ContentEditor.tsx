import { useEffect, useState } from "react";
import { api, type SiteContent } from "../lib/api";

interface Props {
  onNavigate: (page: string) => void;
}

const DEFAULT: SiteContent = {
  about: {
    eyebrow: "Our Story",
    heading: "Where Technology Meets Artistry",
    paragraphs: ["", "", ""],
    signerName: "Amirul",
    signerTitle: "Lead CAD Designer & Founder",
    stats: [
      { value: "500+", label: "Designs Created" },
      { value: "8+", label: "Years Experience" },
      { value: "100%", label: "Client Satisfaction" },
      { value: "48h", label: "Average Turnaround" },
    ],
  },
  contact: {
    whatsapp: "+918016654314",
    email: "skamirulcad8016@gmail.com",
    address: "Newtown, Kolkata, West Bengal, India — 700135",
  },
  hero: {
    eyebrow: "Premium Jewelry CAD Design",
    title: "Amirul Jewelry CAD Studio",
    subtitle: "Precision CAD Designs for Modern Jewelry",
  },
};

export default function ContentEditor({ onNavigate }: Props) {
  const [content, setContent] = useState<SiteContent>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"hero" | "about" | "contact">("hero");

  useEffect(() => {
    api.getContent().then((data) => {
      setContent(data);
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await api.updateContent(content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updatePath = (path: string[], value: string) => {
    setContent((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as SiteContent;
      let obj: Record<string, unknown> = next as unknown as Record<string, unknown>;
      for (let i = 0; i < path.length - 1; i++) {
        obj = obj[path[i]] as Record<string, unknown>;
      }
      obj[path[path.length - 1]] = value;
      return next;
    });
  };

  const updateStat = (idx: number, field: "value" | "label", val: string) => {
    setContent((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as SiteContent;
      next.about.stats[idx][field] = val;
      return next;
    });
  };

  const updateParagraph = (idx: number, val: string) => {
    setContent((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as SiteContent;
      next.about.paragraphs[idx] = val;
      return next;
    });
  };

  if (loading) return <div className="page-content"><p className="loading-text">Loading content…</p></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Edit Content</h1>
          <p className="page-sub">Changes go live on the public website immediately</p>
        </div>
        <button className="btn-gold" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
        </button>
      </div>

      {error && <p className="form-error" style={{ marginBottom: 20 }}>{error}</p>}

      {/* Tab nav */}
      <div className="tab-nav">
        {(["hero", "about", "contact"] as const).map((t) => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Hero tab */}
      {tab === "hero" && (
        <div className="form-section">
          <h2 className="form-section-title">Hero Section</h2>
          <div className="form-group">
            <label className="form-label">Eyebrow Text</label>
            <input className="form-input" value={content.hero.eyebrow} onChange={(e) => updatePath(["hero", "eyebrow"], e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Main Title</label>
            <input className="form-input" value={content.hero.title} onChange={(e) => updatePath(["hero", "title"], e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Subtitle</label>
            <input className="form-input" value={content.hero.subtitle} onChange={(e) => updatePath(["hero", "subtitle"], e.target.value)} />
          </div>
        </div>
      )}

      {/* About tab */}
      {tab === "about" && (
        <div className="form-section">
          <h2 className="form-section-title">About Section</h2>
          <div className="form-group">
            <label className="form-label">Eyebrow</label>
            <input className="form-input" value={content.about.eyebrow} onChange={(e) => updatePath(["about", "eyebrow"], e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Heading</label>
            <input className="form-input" value={content.about.heading} onChange={(e) => updatePath(["about", "heading"], e.target.value)} />
          </div>

          <label className="form-label" style={{ marginBottom: 8 }}>Paragraphs</label>
          {content.about.paragraphs.map((p, i) => (
            <div className="form-group" key={i} style={{ marginBottom: 12 }}>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder={`Paragraph ${i + 1}`}
                value={p}
                onChange={(e) => updateParagraph(i, e.target.value)}
              />
            </div>
          ))}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Signer Name</label>
              <input className="form-input" value={content.about.signerName} onChange={(e) => updatePath(["about", "signerName"], e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Signer Title</label>
              <input className="form-input" value={content.about.signerTitle} onChange={(e) => updatePath(["about", "signerTitle"], e.target.value)} />
            </div>
          </div>

          <label className="form-label" style={{ marginBottom: 8 }}>Stats</label>
          <div className="stats-editor">
            {content.about.stats.map((stat, i) => (
              <div key={i} className="stat-editor-row">
                <input className="form-input" placeholder="Value (e.g. 500+)" value={stat.value} onChange={(e) => updateStat(i, "value", e.target.value)} />
                <input className="form-input" placeholder="Label" value={stat.label} onChange={(e) => updateStat(i, "label", e.target.value)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact tab */}
      {tab === "contact" && (
        <div className="form-section">
          <h2 className="form-section-title">Contact Details</h2>
          <div className="form-group">
            <label className="form-label">WhatsApp Number</label>
            <input className="form-input" placeholder="+918016654314" value={content.contact.whatsapp} onChange={(e) => updatePath(["contact", "whatsapp"], e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" value={content.contact.email} onChange={(e) => updatePath(["contact", "email"], e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input className="form-input" value={content.contact.address} onChange={(e) => updatePath(["contact", "address"], e.target.value)} />
          </div>
        </div>
      )}

      <div className="form-footer" style={{ marginTop: 32 }}>
        <button className="btn-gold" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : saved ? "✓ Saved!" : "Save All Changes"}
        </button>
      </div>
    </div>
  );
}
