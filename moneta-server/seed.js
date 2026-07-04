import dotenv from "dotenv";
import crypto from "crypto";
import { connectDB } from "./db.js";
import { auth } from "./auth.js";
import Coupon from "./models/Coupon.js";
import User from "./models/User.js";

// Load configs
dotenv.config();

const seed = async () => {
  try {
    console.log("Initializing database connection...");
    await connectDB();

    const phone = "01234567890";
    const password = "password123";
    const pin = "1234";

    // Hash PIN using standard SHA-256 matching our client hashing
    const hashedPin = crypto.createHash("sha256").update(pin).digest("hex");

    console.log("Checking if default user already exists...");
    const userExists = await User.findOne({ phone });

    if (userExists) {
      console.log(`Default user with phone ${phone} already exists in the database.`);
    } else {
      console.log(`Creating default user:`);
      console.log(`- Name: Default User`);
      console.log(`- Mobile Number: ${phone}`);
      console.log(`- Password: ${password}`);
      console.log(`- PIN: ${pin}`);

      // Call Better Auth programmatically to setup password hash and auth schema
      await auth.api.signUpEmail({
        body: {
          email: `${phone}@moneta.local`,
          password,
          name: "Default User",
          phone,
          pin: hashedPin,
        },
      });
      console.log("Default user created successfully.");
    }

    // Seed default promotional coupon rewards
    console.log("Seeding promotional coupons...");
    const coupons = [
      { code: "WELCOME50", bonusAmount: 50 },
      { code: "MONETA100", bonusAmount: 100 },
    ];

    for (const cp of coupons) {
      const exists = await Coupon.findOne({ code: cp.code });
      if (!exists) {
        await Coupon.create(cp);
        console.log(`- Coupon created: ${cp.code} ($${cp.bonusAmount} reward)`);
      } else {
        console.log(`- Coupon ${cp.code} already exists.`);
      }
    }

    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Database seeding failed:", error.message);
    process.exit(1);
  }
};

seed();
