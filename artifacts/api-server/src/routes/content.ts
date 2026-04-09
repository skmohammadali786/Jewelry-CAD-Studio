import { Router } from "express";
import { getContent, saveContent, type SiteContent } from "../lib/storage.js";
import { requireAdmin } from "../middlewares/auth.js";

const router = Router();

/* Public: get site content */
router.get("/content", async (_req, res) => {
  try {
    const content = await getContent();
    res.json(content);
  } catch (err) {
    console.error("GET /content error:", err);
    res.status(500).json({ error: "Failed to read content" });
  }
});

/* Admin: update site content */
router.put("/admin/content", requireAdmin, async (req, res) => {
  try {
    const body = req.body as SiteContent;
    await saveContent(body);
    res.json(body);
  } catch (err) {
    console.error("PUT /admin/content error:", err);
    res.status(500).json({ error: "Failed to update content" });
  }
});

export default router;
