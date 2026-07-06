import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import { Product } from "../product/product.model";
import { Sale } from "../sale/sale.model";

const LOW_STOCK_THRESHOLD = 5;

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const [totalProducts, totalSales, lowStockProducts] = await Promise.all([
    Product.countDocuments(),
    Sale.countDocuments(),
    Product.find({ stockQuantity: { $lt: LOW_STOCK_THRESHOLD } }).sort("stockQuantity"),
  ]);

  return sendSuccess(
    res,
    200,
    {
      totalProducts,
      totalSales,
      lowStockProducts,
    },
    "Dashboard stats fetched successfully"
  );
});
