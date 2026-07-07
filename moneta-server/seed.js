import dotenv from "dotenv";
import crypto from "crypto";
import { connectDB } from "./db.js";
import { auth } from "./auth.js";
import Coupon from "./models/Coupon.js";
import User from "./models/User.js";
import Biller from "./models/Biller.js";
import DepositSource from "./models/DepositSource.js";

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

    // Seed default Billers
    console.log("Seeding default billers...");
    const billers = [
      { name: "DESCO Electricity", category: "utility" },
      { name: "Dhaka WASA Water", category: "utility" },
      { name: "Karnaphuli Gas", category: "utility" },
      { name: "Link3 Internet", category: "utility" },
    ];
    for (const b of billers) {
      const exists = await Biller.findOne({ name: b.name });
      if (!exists) {
        await Biller.create(b);
        console.log(`- Biller created: ${b.name}`);
      } else {
        console.log(`- Biller ${b.name} already exists.`);
      }
    }

    // Seed default Deposit Sources
    console.log("Seeding default deposit sources...");
    const depositSources = [
      { name: "Visa Debit Card", type: "card", details: "*4221" },
      { name: "Mastercard Gold", type: "card", details: "*8890" },
      { name: "City Bank Account", type: "bank", details: "" },
      { name: "BRAC Bank Account", type: "bank", details: "" },
    ];
    for (const ds of depositSources) {
      const exists = await DepositSource.findOne({ name: ds.name });
      if (!exists) {
        await DepositSource.create(ds);
        console.log(`- Deposit Source created: ${ds.name}`);
      } else {
        console.log(`- Deposit Source ${ds.name} already exists.`);
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
