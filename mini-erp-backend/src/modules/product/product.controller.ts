import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import * as productService from "./product.service";

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.listProducts(req.query as Record<string, unknown>);
  return sendSuccess(res, 200, result, "Products fetched successfully");
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id);
  return sendSuccess(res, 200, product, "Product fetched successfully");
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const { name, sku, category, purchasePrice, sellingPrice, stockQuantity } = req.body;
  const product = await productService.createProduct(
    {
      name,
      sku,
      category,
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      stockQuantity: Number(stockQuantity),
    },
    req.file,
    req.user!.id
  );
  return sendSuccess(res, 201, product, "Product created successfully");
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { name, sku, category, purchasePrice, sellingPrice, stockQuantity } = req.body;
  const input: Record<string, unknown> = {};
  if (name !== undefined) input.name = name;
  if (sku !== undefined) input.sku = sku;
  if (category !== undefined) input.category = category;
  if (purchasePrice !== undefined) input.purchasePrice = Number(purchasePrice);
  if (sellingPrice !== undefined) input.sellingPrice = Number(sellingPrice);
  if (stockQuantity !== undefined) input.stockQuantity = Number(stockQuantity);

  const product = await productService.updateProduct(req.params.id, input, req.file);
  return sendSuccess(res, 200, product, "Product updated successfully");
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id);
  return sendSuccess(res, 200, null, "Product deleted successfully");
});
