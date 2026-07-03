import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("FATAL ERROR: MONGODB_URI is not set in environment variables!");
  process.exit(1);
}

let isConnected = false;

export async function connectDB() {
  if (isConnected && mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    isConnected = true;
    console.log("Connected to MongoDB Atlas successfully.");
    return conn;
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    throw err;
  }
}

export async function getMongoClient() {
  await connectDB();
  return mongoose.connection.getClient();
}
