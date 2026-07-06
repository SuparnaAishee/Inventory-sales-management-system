import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../config/db";
import { User } from "../modules/user/user.model";
import mongoose from "mongoose";

async function seedAdmin() {
  await connectDB();

  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin@12345";
  const name = process.env.SEED_ADMIN_NAME ?? "Admin";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin user already exists: ${email}`);
  } else {
    await User.create({ name, email, password, role: "admin" });
    console.log(`Admin user created: ${email} / ${password}`);
  }

  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error("Failed to seed admin user:", err);
  process.exit(1);
});
