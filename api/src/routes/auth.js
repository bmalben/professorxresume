import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { User } from "../models/User.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

function signToken(userId) {
  return jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: "7d" });
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({ error: "Name, email, and password (8+ chars) required" });
    }
    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) return res.status(409).json({ error: "Email already registered" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      passwordHash,
    });
    const token = signToken(user._id.toString());
    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, title: user.title, company: user.company, role: user.role },
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = signToken(user._id.toString());
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, title: user.title, company: user.company, role: user.role },
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error" });
  }
});

router.get("/me", authRequired, async (req, res) => {
  const user = await User.findById(req.userId).select("name email title company");
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({
    user: { id: user._id, name: user.name, email: user.email, title: user.title, company: user.company },
  });
});

router.patch("/profile", authRequired, async (req, res) => {
  const { name, title, company } = req.body || {};
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (name != null) user.name = String(name).trim();
  if (title != null) user.title = String(title).trim();
  if (company != null) user.company = String(company).trim();
  await user.save();
  return res.json({
    user: { id: user._id, name: user.name, email: user.email, title: user.title, company: user.company },
  });
});

export default router;
