import { Router } from "express";
import { getDesigns, saveDesigns, type Design } from "../lib/storage.js";
import { requireAdmin } from "../middlewares/auth.js";

const router = Router();

/* Public: list all designs */
router.get("/designs", (_req, res) => {
  try {
    res.json(getDesigns());
  } catch (err) {
    res.status(500).json({ error: "Failed to read designs" });
  }
});

/* Admin: create design */
router.post("/admin/designs", requireAdmin, (req, res) => {
  try {
    const body = req.body as Omit<Design, "id">;
    const designs = getDesigns();

    const id = `aj-${Date.now()}`;
    const newDesign: Design = {
      id,
      code: body.code?.trim() || `AJ-${designs.length + 1}`.padStart(6, "0"),
      name: body.name?.trim() || "Untitled Design",
      category: body.category?.trim() || "Ring",
      material: body.material?.trim() || "",
      style: body.style?.trim() || "",
      description: body.description?.trim() || "",
      image: body.image?.trim() || "",
    };

    designs.push(newDesign);
    saveDesigns(designs);
    res.status(201).json(newDesign);
  } catch {
    res.status(500).json({ error: "Failed to create design" });
  }
});

/* Admin: update design */
router.put("/admin/designs/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const designs = getDesigns();
    const idx = designs.findIndex((d) => d.id === id);
    if (idx === -1) {
      res.status(404).json({ error: "Design not found" });
      return;
    }

    const body = req.body as Partial<Design>;
    designs[idx] = {
      ...designs[idx],
      code: body.code?.trim() || designs[idx].code,
      name: body.name?.trim() || designs[idx].name,
      category: body.category?.trim() || designs[idx].category,
      material: body.material?.trim() ?? designs[idx].material,
      style: body.style?.trim() ?? designs[idx].style,
      description: body.description?.trim() ?? designs[idx].description,
      image: body.image?.trim() ?? designs[idx].image,
    };

    saveDesigns(designs);
    res.json(designs[idx]);
  } catch {
    res.status(500).json({ error: "Failed to update design" });
  }
});

/* Admin: delete design */
router.delete("/admin/designs/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const designs = getDesigns();
    const idx = designs.findIndex((d) => d.id === id);
    if (idx === -1) {
      res.status(404).json({ error: "Design not found" });
      return;
    }
    designs.splice(idx, 1);
    saveDesigns(designs);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete design" });
  }
});

export default router;
