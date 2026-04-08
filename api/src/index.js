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

app.use((err, _req, res, _next) => {
  log.error(err);
  res.status(500).json({ error: "Internal server error" });
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
