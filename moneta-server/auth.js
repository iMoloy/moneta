import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getMongoClient } from "./db.js";

const client = await getMongoClient();
const db = client.db();

const trustedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://moneta-client.vercel.app",
  "https://moneta.vercel.app",
  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
].filter((origin, index, array) => array.indexOf(origin) === index);

export const auth = betterAuth({
  database: mongodbAdapter(db),
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: true,
        input: true,
      },
      pin: {
        type: "string", // Hashed 4-digit PIN for transactions
        required: true,
        input: true,
      },
      balance: {
        type: "number",
        required: false,
        defaultValue: 45000,
        input: false, // Cannot be set by user signup input directly
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache session for 5 minutes
    },
  },
});
