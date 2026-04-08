import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { User } from "../models/User.js";

export function authRequired(req, res, next) {
  const h = req.headers.authorization;
  const token = h?.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export async function attachUserOptional(req, res, next) {
  const h = req.headers.authorization;
  const token = h?.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.userId = payload.sub;
    const u = await User.findById(payload.sub).select("name email title company role");
    req.user = u;
  } catch {
    /* ignore */
  }
  next();
}

export async function adminRequired(req, res, next) {
  authRequired(req, res, async () => {
    try {
      const user = await User.findById(req.userId).select("role");
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      next();
    } catch {
      return res.status(500).json({ error: "Server error verifying role" });
    }
  });
}
