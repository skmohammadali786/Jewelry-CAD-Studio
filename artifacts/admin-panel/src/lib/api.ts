/**
 * API client for the admin panel.
 *
 * In development (Replit): API is at /api (same origin, routed by proxy)
 * In production (Vercel): Set VITE_API_BASE_URL to your API Vercel project URL
 *   e.g.  VITE_API_BASE_URL=https://your-api.vercel.app
 */
const BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "") + "/api";

function getToken(): string | null {
  return localStorage.getItem("aj_admin_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || "Request failed");
  }
  return res.json() as Promise<T>;
}

export const api = {
  login: (password: string) =>
    req<{ token: string }>("POST", "/admin/login", { password }),

  getDesigns: () => req<Design[]>("GET", "/designs"),
  createDesign: (data: Omit<Design, "id">) =>
    req<Design>("POST", "/admin/designs", data),
  updateDesign: (id: string, data: Partial<Design>) =>
    req<Design>("PUT", `/admin/designs/${id}`, data),
  deleteDesign: (id: string) =>
    req<{ success: boolean }>("DELETE", `/admin/designs/${id}`),
  bulkImportDesigns: (rows: Array<Omit<Design, "id">>) =>
    req<{ imported: number; errors: Array<{ row: number; error: string }>; designs: Design[] }>(
      "POST", "/admin/designs/bulk", rows
    ),

  getContent: () => req<SiteContent>("GET", "/content"),
  updateContent: (data: SiteContent) =>
    req<SiteContent>("PUT", "/admin/content", data),
};

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
