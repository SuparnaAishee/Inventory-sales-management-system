import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../modules/user/user.model";

const DEMO_USERS = [
  { name: "Demo Manager", email: "manager@example.com", password: "Manager@12345", role: "manager" as const },
  { name: "Demo Employee", email: "employee@example.com", password: "Employee@12345", role: "employee" as const },
];

async function seedDemoUsers() {
  await connectDB();

  for (const demoUser of DEMO_USERS) {
    const existing = await User.findOne({ email: demoUser.email });
    if (existing) {
      console.log(`User already exists, skipping: ${demoUser.email}`);
      continue;
    }
    await User.create(demoUser);
    console.log(`Created ${demoUser.role}: ${demoUser.email} / ${demoUser.password}`);
  }

  await mongoose.disconnect();
}

seedDemoUsers().catch((err) => {
  console.error("Failed to seed demo users:", err);
  process.exit(1);
});
