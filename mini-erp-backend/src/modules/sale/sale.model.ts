import { Document, Schema, model } from "mongoose";

export interface ISaleItem {
  product: Schema.Types.ObjectId;
  quantity: number;
  priceAtSale: number;
  subtotal: number;
}

export interface ISale extends Document {
  items: ISaleItem[];
  grandTotal: number;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const saleItemSchema = new Schema<ISaleItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    priceAtSale: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const saleSchema = new Schema<ISale>(
  {
    items: {
      type: [saleItemSchema],
      required: true,
      validate: {
        validator: (items: ISaleItem[]) => items.length > 0,
        message: "A sale must contain at least one product",
      },
    },
    grandTotal: { type: Number, required: true, min: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Sale = model<ISale>("Sale", saleSchema);
