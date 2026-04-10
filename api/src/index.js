import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pino from "pino";
import pinoHttp from "pino-http";
import { connectDb } from "./db.js";
import { config } from "./config.js";
import authRoutes from "./routes/auth.js";
import aiRoutes from "./routes/ai.js";
import interviewRoutes from "./routes/interviews.js";
import dashboardRoutes from "./routes/dashboard.js";
import adminRoutes from "./routes/admin.js";

const log = pino({ level: config.nodeEnv === "production" ? "info" : "debug" });

const app = express();
app.use(
  pinoHttp({
    logger: log,
    autoLogging: { ignore: (req) => req.url === "/health" },
  })
);
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "512kb" }));

const globalLimiter = rateLimit({
  windowMs: 60_000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

app.get("/health", (_req, res) => {
  res.type("text").send("ok");
});

app.use("/auth", authRoutes);
app.use("/ai", aiRoutes);
app.use("/interviews", interviewRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/admin", adminRoutes);

app.use((err, _req, res, _next) => {
  log.error(err);
  const status = err.status || 500;
  const message = status < 500 ? err.message : "Internal server error";
  res.status(status).json({ error: message });
});

async function main() {
  await connectDb();
  app.listen(config.port, "0.0.0.0", () => {
    log.info({ port: config.port, model: config.geminiModel }, "API listening");
  });
}

main().catch((err) => {
  log.error(err);
  process.exit(1);
});
