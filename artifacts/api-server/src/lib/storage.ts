import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";

const DATA_DIR = resolve(process.cwd(), "data");

function ensureDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson<T>(filename: string, defaultValue: T): T {
  const filePath = resolve(DATA_DIR, filename);
  try {
    if (!existsSync(filePath)) return defaultValue;
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

function writeJson<T>(filename: string, data: T): void {
  ensureDir();
  const filePath = resolve(DATA_DIR, filename);
  writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

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

interface DesignsFile {
  designs: Design[];
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

const DEFAULT_DESIGNS: DesignsFile = { designs: [] };
const DEFAULT_CONTENT: SiteContent = {
  about: {
    eyebrow: "Our Story",
    heading: "Where Technology Meets Artistry",
    paragraphs: [],
    signerName: "Amirul",
    signerTitle: "Lead CAD Designer & Founder",
    stats: [],
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

export function getDesigns(): Design[] {
  return readJson<DesignsFile>("designs.json", DEFAULT_DESIGNS).designs;
}

export function saveDesigns(designs: Design[]): void {
  writeJson<DesignsFile>("designs.json", { designs });
}

export function getContent(): SiteContent {
  return readJson<SiteContent>("content.json", DEFAULT_CONTENT);
}

export function saveContent(content: SiteContent): void {
  writeJson<SiteContent>("content.json", content);
}
