// server.js
import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./db/db.js";
import User from "./model/user.model.js";
import bcrypt from "bcryptjs";

dotenv.config();

// Connect to MongoDB
connectDb();

const app = express();
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: "https://testing-phi-rose.vercel.app", // full URL including https://
  credentials: true,  // required if sending cookies
}));

const JWT_SECRET = process.env.JWT_SECRET;

// Helper functions for JWT
const createAccessToken = (user) =>
  jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
    expiresIn: "15m",
  });

const createRefreshToken = (user) =>
  jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
    expiresIn: "7d",
  });

// ======================== ROUTES ======================== //

// Register
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user)
      return res.status(401).json({ message: "Invalid username or password" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid username or password" });

    // Generate tokens
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    // Set cookies
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Protected route
app.get("/api/profile", async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ message: "No token found" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    res.json({ message: "Access granted", user });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

// Logout
app.post("/api/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
