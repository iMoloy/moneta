import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";

// Load configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with support for credentials (required for cookies-based auth sessions)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Better Auth routes handler
app.all("/api/auth/*", toNodeHandler(auth));

app.use(express.json());

// Basic sanity check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Moneta Server is running" });
});

// Database connection
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  mongoose
    .connect(mongoUri)
    .then(() => console.log("Connected to MongoDB Atlas successfully."))
    .catch((err) => console.error("MongoDB connection failed:", err.message));
} else {
  console.warn("WARNING: MONGODB_URI is not set in environment variables!");
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
