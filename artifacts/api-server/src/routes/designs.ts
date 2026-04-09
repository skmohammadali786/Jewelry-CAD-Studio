import { Router } from "express";
import { getDesigns, saveNewDesign, updateDesign, deleteDesign, type Design } from "../lib/storage.js";
import { requireAdmin } from "../middlewares/auth.js";

const router = Router();

/* Public: list all designs */
router.get("/designs", async (_req, res) => {
  try {
    const designs = await getDesigns();
    res.json(designs);
  } catch (err) {
    console.error("GET /designs error:", err);
    res.status(500).json({ error: "Failed to read designs" });
  }
});

/* Admin: create design */
router.post("/admin/designs", requireAdmin, async (req, res) => {
  try {
    const body = req.body as Omit<Design, "id">;
    const newDesign = await saveNewDesign({
      id: `aj-${Date.now()}`,
      code: body.code?.trim() || "",
      name: body.name?.trim() || "Untitled Design",
      category: body.category?.trim() || "Ring",
      material: body.material?.trim() || "",
      style: body.style?.trim() || "",
      description: body.description?.trim() || "",
      image: body.image?.trim() || "",
    });
    res.status(201).json(newDesign);
  } catch (err) {
    console.error("POST /admin/designs error:", err);
    res.status(500).json({ error: "Failed to create design" });
  }
});

/* Admin: update design */
router.put("/admin/designs/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body as Partial<Design>;
    const designs = await getDesigns();
    const existing = designs.find((d) => d.id === id);
    if (!existing) {
      res.status(404).json({ error: "Design not found" });
      return;
    }
    const updated = await updateDesign(id, {
      code: body.code?.trim() ?? existing.code,
      name: body.name?.trim() ?? existing.name,
      category: body.category?.trim() ?? existing.category,
      material: body.material?.trim() ?? existing.material,
      style: body.style?.trim() ?? existing.style,
      description: body.description?.trim() ?? existing.description,
      image: body.image?.trim() ?? existing.image,
    });
    res.json(updated);
  } catch (err) {
    console.error("PUT /admin/designs error:", err);
    res.status(500).json({ error: "Failed to update design" });
  }
});

/* Admin: delete design */
router.delete("/admin/designs/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteDesign(id);
    if (!deleted) {
      res.status(404).json({ error: "Design not found" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /admin/designs error:", err);
    res.status(500).json({ error: "Failed to delete design" });
  }
});

export default router;
