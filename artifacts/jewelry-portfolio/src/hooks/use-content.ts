import { useState, useEffect } from "react";

export interface SiteContent {
  hero: { eyebrow: string; title: string; subtitle: string };
  about: {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
    signerName: string;
    signerTitle: string;
    stats: Array<{ value: string; label: string }>;
  };
  contact: { whatsapp: string; email: string; address: string };
}

const DEFAULT: SiteContent = {
  hero: {
    eyebrow: "Premium Jewelry CAD Design",
    title: "Amirul Jewelry CAD Studio",
    subtitle: "Precision CAD Designs for Modern Jewelry",
  },
  about: {
    eyebrow: "Our Story",
    heading: "Where Technology Meets Artistry",
    paragraphs: [
      "At Amirul Jewelry CAD Studio, we bridge the gap between traditional jewelry craftsmanship and modern digital precision. Founded in the heart of Kolkata — India's jewelry capital — we specialize in creating master-quality CAD designs that bring your most ambitious jewelry visions to life.",
      "Every design we produce is a marriage of mathematical precision and artistic sensibility. We use industry-leading parametric modeling tools to craft pieces that not only look breathtaking on screen but translate flawlessly into physical jewelry — whether cast in gold, silver, or platinum.",
      "Our clients range from independent jewelers and boutique brands to large-scale manufacturers across India and internationally. We pride ourselves on fast turnaround, transparent communication, and designs that exceed expectations every time.",
    ],
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
};

export function useContent(): SiteContent {
  const [content, setContent] = useState<SiteContent>(DEFAULT);

  useEffect(() => {
    const apiBase = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
    fetch(`${apiBase}/api/content`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        if (data && typeof data === "object") {
          setContent(data as SiteContent);
        }
      })
      .catch(() => {});
  }, []);

  return content;
}
