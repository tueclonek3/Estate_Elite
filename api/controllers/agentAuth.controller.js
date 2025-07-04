import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import "dotenv/config";

const isValidEmail = (email) => {
    const emailLower = email.toLowerCase();
    const regex = /^[^\s@]+@gmail\.com$/;
    return regex.test(emailLower);
};

export const agentRegister = async (req, res) => {
  try {
    const { email, password, confirmedPassword, displayName } = req.body;

    // Validate required fields
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!password)
      return res.status(400).json({ error: "Password is required" });
    if (!confirmedPassword)
      return res
        .status(400)
        .json({ error: "Password confirmation is required" });
    if (!displayName)
      return res.status(400).json({ error: "Display name is required" });

    // Validate email format - must be @gmail.com
    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Invalid email domain",
        details: "Only @gmail.com email addresses are accepted",
      });
    }

    // Validate password match
    if (password !== confirmedPassword) {
      return res.status(400).json({
        error: "Passwords do not match",
        details: "The password and confirmed password fields must be identical",
      });
    }

    // Generate username from email
    const baseUsername = email
      .split("@")[0]
      .replace(/[^a-zA-Z0-9_]/g, "") 
      .substring(0, 15); // Truncate

    if (!baseUsername) {
      return res.status(400).json({
        error: "Invalid email prefix",
        details: "Could not generate username from email address",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create agent
    const newAgent = await prisma.agent.create({
      data: {
        email: email.toLowerCase(),
        displayName,
        password: hashedPassword,
        username: baseUsername,
      },
    });

    // Return response without password
    const { password: _, ...agentData } = newAgent;
    res.status(201).json({
      message: "Agent registration successful!",
      agent: agentData,
    });
  } catch (error) {
    console.error("Agent registration error:", error);

    // Handle unique constraint errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const field = error.meta?.target?.[0] || "field";
        if (field === "email") {
          return res.status(400).json({
            error: "Email already registered",
            details:
              "This email address is already associated with an agent account",
          });
        }
        if (field === "username") {
          return res.status(400).json({
            error: "Username conflict",
            details:
              "The system-generated username already exists. Please try a different email address",
          });
        }
      }
    }

    res.status(500).json({
      error: "Internal server error",
      details:
        "Something went wrong during agent registration. Please try again later",
    });
  }
};

export const agentLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const agent = await prisma.agent.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!agent) {
      return res.status(401).json({ message: "Invalid Credentials!" });
    }

    const isPasswordValid = await bcrypt.compare(password, agent.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Credentials!" });
    }

    const age = 1000 * 60 * 60 * 24 * 7; // 1 week
    const token = jwt.sign(
      { id: agent.id, role: "agent" },
      process.env.JWT_SECRET_KEY,
      { expiresIn: age }
    );

    // Return agent data without password
    const { password: _, ...agentData } = agent;

    res
      .cookie("agentToken", token, {
        httpOnly: true,
        maxAge: age,
      })
      .status(200)
      .json({
        message: "Agent Login Successful",
        agent: agentData,
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to login!" });
  }
};

export const agentLogout = (req, res) => {
  res
    .clearCookie("agentToken")
    .status(200)
    .json({ message: "Agent Logout Successful" });
};
