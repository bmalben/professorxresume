import mongoose from "mongoose";
import { config } from "./config.js";
import pino from "pino";

const log = pino({ level: config.nodeEnv === "production" ? "info" : "debug" });

export async function connectDb() {
  await mongoose.connect(config.mongoUri);
  log.info("MongoDB connected");
}
