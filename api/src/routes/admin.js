import { Router } from "express";
import { User } from "../models/User.js";
import { adminRequired } from "../middleware/auth.js";

const router = Router();

router.use(adminRequired);

router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}).select("-passwordHash").sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.userId) {
      return res.status(400).json({ error: "Cannot delete yourself from the admin panel." });
    }
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
