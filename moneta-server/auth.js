import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getMongoClient } from "./db.js";

const client = await getMongoClient();
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  trustedOrigins: ["http://localhost:3000"],
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
