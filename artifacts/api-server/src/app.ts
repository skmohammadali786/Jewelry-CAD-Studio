import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app: Express = express();

/* CORS — allow any origin in dev; lock to ALLOWED_ORIGINS in prod */
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
  : [];

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" && allowedOrigins.length > 0
        ? (origin, cb) => {
            if (!origin || allowedOrigins.includes(origin)) cb(null, true);
            else cb(new Error("Not allowed by CORS"));
          }
        : true,
    credentials: true,
  })
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
