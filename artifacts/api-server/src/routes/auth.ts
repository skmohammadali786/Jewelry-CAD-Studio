import { Router } from "express";
import { signAdminToken } from "../middlewares/auth.js";

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "AmirulCAD@2025";

router.post("/admin/login", (req, res) => {
  const { password } = req.body as { password?: string };
  if (!password || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  const token = signAdminToken();
  res.json({ token });
});

export default router;
