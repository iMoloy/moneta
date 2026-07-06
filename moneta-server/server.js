import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import walletRouter from "./routes/wallet.js";

// Load configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const clientOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://moneta-topaz.vercel.app",
  "https://moneta-client.vercel.app",
  "https://moneta.vercel.app",
  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  ...(process.env.NEXT_PUBLIC_CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
].filter((origin, index, array) => array.indexOf(origin) === index);

// Enable CORS with support for credentials (required for cookies-based auth sessions)
app.options("*", cors({ origin: clientOrigins, credentials: true }));
app.use(
  cors({
    origin: clientOrigins,
    credentials: true,
  }),
);

// Better Auth routes handler
app.all("/api/auth/*", toNodeHandler(auth));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Wallet API Routes
app.use("/api/wallet", walletRouter);

// Basic sanity check routes
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Moneta Server is running" });
});

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

if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export default app;
