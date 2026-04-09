import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import designsRouter from "./designs.js";
import contentRouter from "./content.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(designsRouter);
router.use(contentRouter);

export default router;
