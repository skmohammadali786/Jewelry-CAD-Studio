import pg from "pg";
import { resolve } from "path";
import { readFileSync, existsSync } from "fs";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
export interface Design {
  id: string;
  code: string;
  name: string;
  category: string;
  material: string;
  style: string;
  description: string;
  image: string;
}

export interface SiteContent {
  about: {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
    signerName: string;
    signerTitle: string;
    stats: Array<{ value: string; label: string }>;
  };
  contact: {
    whatsapp: string;
    email: string;
    address: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
}

const DEFAULT_CONTENT: SiteContent = {
  about: {
    eyebrow: "Our Story",
    heading: "Where Technology Meets Artistry",
    paragraphs: [
      "At <strong>Amirul Jewelry CAD Studio</strong>, we bridge the gap between traditional jewelry craftsmanship and modern digital precision. Founded in the heart of Kolkata — India's jewelry capital — we specialize in creating master-quality CAD designs that bring your most ambitious jewelry visions to life.",
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
  hero: {
    eyebrow: "Premium Jewelry CAD Design",
    title: "Amirul Jewelry CAD Studio",
    subtitle: "Precision CAD Designs for Modern Jewelry",
  },
};

const INITIAL_DESIGNS: Design[] = [
  { id: "aj-001", code: "AJ-001", name: "Celestial Solitaire Ring", category: "Ring", material: "18K Gold / Platinum", style: "Contemporary Solitaire", description: "An exquisite solitaire ring design featuring a precision-cut central stone setting with delicate milgrain detailing along the band. This CAD model captures every facet with mathematical accuracy, ready for casting in gold or platinum.", image: "/assets/images/AJ-001.jpg" },
  { id: "aj-002", code: "AJ-002", name: "Eternal Bloom Necklace", category: "Necklace", material: "18K White Gold", style: "Floral Elegance", description: "A statement floral necklace rendered in stunning detail — each petal sculpted to perfection with organic curves and precise gemstone placements. The CAD design allows for flawless replication across every piece produced.", image: "/assets/images/AJ-002.jpg" },
  { id: "aj-003", code: "AJ-003", name: "Heritage Filigree Earrings", category: "Earrings", material: "22K Gold", style: "Traditional Filigree", description: "Inspired by centuries-old Indian jewelry traditions, these filigree earrings blend cultural heritage with modern CAD precision. Every wire element and granule is individually modeled for a truly handcrafted appearance.", image: "/assets/images/AJ-003.jpg" },
  { id: "aj-004", code: "AJ-004", name: "Regal Pavé Bracelet", category: "Bracelet", material: "18K Rose Gold", style: "Pavé Setting", description: "A luxurious pavé bracelet where hundreds of micro-set stones create a continuous shimmer effect. The CAD model precisely maps every stone seat, ensuring perfect alignment and maximum light reflection.", image: "/assets/images/AJ-004.jpg" },
  { id: "aj-005", code: "AJ-005", name: "Aurora Halo Pendant", category: "Pendant", material: "Platinum / Diamond", style: "Halo Design", description: "Inspired by the northern lights, this halo pendant features a central medallion surrounded by a cascade of smaller stones. The 3D CAD model enables exact proportional scaling for any stone size requirement.", image: "/assets/images/AJ-005.jpg" },
  { id: "aj-006", code: "AJ-006", name: "Sovereign Cocktail Ring", category: "Ring", material: "18K Gold / Emerald", style: "Cocktail / Statement", description: "A bold cocktail ring designed to command attention. The architectural structure combines geometric precision with flowing organic forms, creating a wearable sculpture that sits comfortably on the finger.", image: "/assets/images/AJ-006.jpg" },
  { id: "aj-007", code: "AJ-007", name: "Luminary Drop Earrings", category: "Earrings", material: "18K Gold / Pearl", style: "Drop / Chandelier", description: "Elegant drop earrings with a graceful cascade design that moves beautifully with the wearer. Each component is engineered for perfect balance and articulation, capturing the timeless beauty of fine jewelry in precise CAD form.", image: "/assets/images/AJ-007.jpg" },
];

/* ------------------------------------------------------------------ */
/*  Table setup (idempotent)                                            */
/* ------------------------------------------------------------------ */
let initialized = false;

async function ensureTables(): Promise<void> {
  if (initialized) return;

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS aj_designs (
        id          TEXT PRIMARY KEY,
        code        TEXT NOT NULL DEFAULT '',
        name        TEXT NOT NULL DEFAULT '',
        category    TEXT NOT NULL DEFAULT '',
        material    TEXT NOT NULL DEFAULT '',
        style       TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        image       TEXT NOT NULL DEFAULT '',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS aj_content (
        key   TEXT PRIMARY KEY,
        value JSONB NOT NULL
      )
    `);

    /* Seed designs if empty */
    const countRes = await client.query("SELECT COUNT(*) FROM aj_designs");
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      for (const d of INITIAL_DESIGNS) {
        await client.query(
          `INSERT INTO aj_designs (id, code, name, category, material, style, description, image)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO NOTHING`,
          [d.id, d.code, d.name, d.category, d.material, d.style, d.description, d.image]
        );
      }
    }

    /* Seed content if empty */
    const cntRes = await client.query("SELECT COUNT(*) FROM aj_content");
    if (parseInt(cntRes.rows[0].count, 10) === 0) {
      await client.query(
        `INSERT INTO aj_content (key, value) VALUES ($1, $2::jsonb) ON CONFLICT DO NOTHING`,
        ["site", JSON.stringify(DEFAULT_CONTENT)]
      );
    }

    initialized = true;
  } finally {
    client.release();
  }
}

/* ------------------------------------------------------------------ */
/*  Public API                                                          */
/* ------------------------------------------------------------------ */
export async function getDesigns(): Promise<Design[]> {
  await ensureTables();
  const res = await pool.query(
    "SELECT id, code, name, category, material, style, description, image FROM aj_designs ORDER BY created_at"
  );
  return res.rows as Design[];
}

export async function saveNewDesign(d: Omit<Design, "id"> & { id: string }): Promise<Design> {
  await ensureTables();
  const res = await pool.query(
    `INSERT INTO aj_designs (id, code, name, category, material, style, description, image)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING id, code, name, category, material, style, description, image`,
    [d.id, d.code, d.name, d.category, d.material, d.style, d.description, d.image]
  );
  return res.rows[0] as Design;
}

export async function updateDesign(id: string, fields: Partial<Design>): Promise<Design | null> {
  await ensureTables();
  const res = await pool.query(
    `UPDATE aj_designs
     SET code=$2, name=$3, category=$4, material=$5, style=$6, description=$7, image=$8
     WHERE id=$1
     RETURNING id, code, name, category, material, style, description, image`,
    [id, fields.code, fields.name, fields.category, fields.material, fields.style, fields.description, fields.image]
  );
  return res.rows[0] as Design ?? null;
}

export async function deleteDesign(id: string): Promise<boolean> {
  await ensureTables();
  const res = await pool.query("DELETE FROM aj_designs WHERE id=$1", [id]);
  return (res.rowCount ?? 0) > 0;
}

export async function getContent(): Promise<SiteContent> {
  await ensureTables();
  const res = await pool.query("SELECT value FROM aj_content WHERE key='site'");
  return (res.rows[0]?.value as SiteContent) ?? DEFAULT_CONTENT;
}

export async function saveContent(content: SiteContent): Promise<void> {
  await ensureTables();
  await pool.query(
    `INSERT INTO aj_content (key, value) VALUES ('site', $1::jsonb)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [JSON.stringify(content)]
  );
}
