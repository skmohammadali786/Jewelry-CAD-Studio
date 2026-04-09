import { Router } from "express";
import { getContent, saveContent, type SiteContent } from "../lib/storage.js";
import { requireAdmin } from "../middlewares/auth.js";

const router = Router();

/* Public: get site content */
router.get("/content", (_req, res) => {
  try {
    res.json(getContent());
  } catch {
    res.status(500).json({ error: "Failed to read content" });
  }
});

/* Admin: update site content */
router.put("/admin/content", requireAdmin, (req, res) => {
  try {
    const body = req.body as SiteContent;
    saveContent(body);
    res.json(body);
  } catch {
    res.status(500).json({ error: "Failed to update content" });
  }
});

export default router;
