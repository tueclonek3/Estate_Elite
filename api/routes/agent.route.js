import express from "express";
import { verifyAgentToken } from "../middleware/verifyToken.js";
import prisma from "../lib/prisma.js";

const router = express.Router();

// Protected agent route example
router.get("/dashboard", verifyAgentToken, async (req, res) => {
  try {
    // Access agent info from req.agent
    const agent = req.agent;
    
    // Get agent's properties
    const properties = await prisma.post.findMany({
      where: { userId: agent.id },
      include: {
        savedPosts: true,
        messages: true
      }
    });
    
    res.status(200).json({
      message: "Agent dashboard data",
      agent: {
        id: agent.id,
        displayName: agent.displayName,
        email: agent.email,
        avatar: agent.avatar
      },
      properties
    });
  } catch (err) {
    console.error("Agent dashboard error:", err);
    res.status(500).json({ message: "Failed to load agent dashboard" });
  }
});

// Add more protected routes as needed
router.get("/profile", verifyAgentToken, (req, res) => {
  const { password, ...safeAgentData } = req.agent;
  res.status(200).json(safeAgentData);
});

export default router;