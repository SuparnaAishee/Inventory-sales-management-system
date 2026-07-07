import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../modules/user/user.model";
import { Product } from "../modules/product/product.model";
import { Sale } from "../modules/sale/sale.model";

const SAMPLE_PRODUCTS = [
  { name: "Wireless Mouse", sku: "WM-001", category: "Electronics", purchasePrice: 300, sellingPrice: 599, stockQuantity: 120, imageKeyword: "computer-mouse" },
  { name: "Mechanical Keyboard", sku: "MK-002", category: "Electronics", purchasePrice: 1200, sellingPrice: 2499, stockQuantity: 60, imageKeyword: "mechanical-keyboard" },
  { name: "USB-C Hub", sku: "UCH-003", category: "Electronics", purchasePrice: 500, sellingPrice: 999, stockQuantity: 80, imageKeyword: "usb-hub" },
  { name: "Office Chair", sku: "OC-004", category: "Furniture", purchasePrice: 3500, sellingPrice: 6999, stockQuantity: 25, imageKeyword: "office-chair" },
  { name: "Standing Desk", sku: "SD-005", category: "Furniture", purchasePrice: 8000, sellingPrice: 14999, stockQuantity: 15, imageKeyword: "standing-desk" },
  { name: "Notebook Pack (5pc)", sku: "NB-006", category: "Stationery", purchasePrice: 100, sellingPrice: 199, stockQuantity: 300, imageKeyword: "notebook,stationery" },
  { name: "Gel Pen Box", sku: "GP-007", category: "Stationery", purchasePrice: 50, sellingPrice: 99, stockQuantity: 400, imageKeyword: "gel-pens" },
  { name: "Desk Lamp", sku: "DL-008", category: "Furniture", purchasePrice: 600, sellingPrice: 1199, stockQuantity: 50, imageKeyword: "desk-lamp" },
  { name: "Bluetooth Speaker", sku: "BS-009", category: "Electronics", purchasePrice: 900, sellingPrice: 1799, stockQuantity: 40, imageKeyword: "bluetooth-speaker" },
  { name: "Laptop Stand", sku: "LS-010", category: "Electronics", purchasePrice: 400, sellingPrice: 799, stockQuantity: 70, imageKeyword: "laptop-stand" },
];

async function seedData() {
  await connectDB();

  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    throw new Error("No admin user found. Run `npm run seed:admin` first.");
  }

  await Product.deleteMany({});
  await Sale.deleteMany({});

  const products = await Product.insertMany(
    SAMPLE_PRODUCTS.map(({ imageKeyword, ...p }, index) => ({
      ...p,
      imageUrl: `https://loremflickr.com/400/300/${imageKeyword}?lock=${index + 1}`,
      createdBy: admin._id,
    }))
  );
  console.log(`Inserted ${products.length} products`);

  const sales = [];
  for (let i = 0; i < 5; i++) {
    const product = products[i * 2 % products.length];
    const quantity = (i % 3) + 1;
    const subtotal = product.sellingPrice * quantity;
    sales.push({
      items: [
        {
          product: product._id,
          quantity,
          priceAtSale: product.sellingPrice,
          subtotal,
        },
      ],
      grandTotal: subtotal,
      createdBy: admin._id,
    });
  }
  const createdSales = await Sale.insertMany(sales);
  console.log(`Inserted ${createdSales.length} sales`);

  await mongoose.disconnect();
}

seedData().catch((err) => {
  console.error("Failed to seed data:", err);
  process.exit(1);
});
