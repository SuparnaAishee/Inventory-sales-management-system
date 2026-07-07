import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { Permission } from "../modules/rbac/permission.model";
import { Role } from "../modules/rbac/role.model";
import { ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from "../modules/rbac/permission.constants";

async function seedRoles() {
  await connectDB();

  for (const permission of ALL_PERMISSIONS) {
    await Permission.findOneAndUpdate(
      { key: permission.key },
      { key: permission.key, description: permission.description },
      { upsert: true, new: true }
    );
  }
  console.log(`Upserted ${ALL_PERMISSIONS.length} permissions`);

  for (const [roleName, permissions] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    const existing = await Role.findOne({ name: roleName });
    if (existing) {
      console.log(`Role already exists, skipping: ${roleName}`);
      continue;
    }
    await Role.create({ name: roleName, permissions });
    console.log(`Created role: ${roleName} -> [${permissions.join(", ")}]`);
  }

  await mongoose.disconnect();
}

seedRoles().catch((err) => {
  console.error("Failed to seed roles:", err);
  process.exit(1);
});
