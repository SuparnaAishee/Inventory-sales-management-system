import { Document, Schema, model } from "mongoose";

export interface IRole extends Document {
  name: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true, trim: true, lowercase: true },
    permissions: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Role = model<IRole>("Role", roleSchema);
