import { Document, Schema, model } from "mongoose";

export interface IPermission extends Document {
  key: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const Permission = model<IPermission>("Permission", permissionSchema);
