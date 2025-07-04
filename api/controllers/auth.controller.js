import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import "dotenv/config";

// Strict email validation for @gmail.com only
const isValidEmail = (email) => {
  // Convert to lowercase for case-insensitive comparison
  const emailLower = email.toLowerCase();

  // Regex to validate format and ensure it ends with @gmail.com
  const regex = /^[^\s@]+@gmail\.com$/;
  return regex.test(emailLower);
};

export const register = async (req, res) => {
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
      .replace(/[^a-zA-Z0-9_]/g, "") // Remove special characters
      .substring(0, 15); // Truncate

    if (!baseUsername) {
      return res.status(400).json({
        error: "Invalid email prefix",
        details: "Could not generate username from email address",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(), // Store in lowercase
        displayName,
        password: hashedPassword,
        username: baseUsername,
      },
    });

    // Return response without password
    const { password: _, ...userData } = newUser;
    res.status(201).json({
      message: "Registration successful!",
      user: userData,
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle unique constraint errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const field = error.meta?.target?.[0] || "field";

        if (field === "email") {
          return res.status(400).json({
            error: "Email already registered",
            details: "This email address is already associated with an account",
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

    // Handle other errors
    res.status(500).json({
      error: "Internal server error",
      details:
        "Something went wrong during registration. Please try again later",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return res.status(401).json({ message: "Invalid Credentials!" });

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid Credentials!" });

    // res.setHeader("Set-Cookie", "test=" + "myValue").json("Success");
    const age = 1000 * 60 * 60 * 24 * 7;

    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: age }
    );

    const { password: _, ...userData } = user;
    res
      .cookie("token", token, {
        httpOnly: true,
        // secure: true
        maxAge: age,
      })
      .status(200)
      .json({ message: "Login Successful", user:userData });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to login!" });
  }
};

export const logout = (req, res) => {
    res.clearCookie("token").status(200).json({message: "Logout Successful"})
};
