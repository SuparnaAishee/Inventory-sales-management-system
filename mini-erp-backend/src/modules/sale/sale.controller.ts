import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import * as saleService from "./sale.service";

export const createSale = asyncHandler(async (req: Request, res: Response) => {
  const { items } = req.body;
  const sale = await saleService.createSale(items, req.user!.id);
  return sendSuccess(res, 201, sale, "Sale created successfully");
});

export const getSales = asyncHandler(async (req: Request, res: Response) => {
  const result = await saleService.listSales(req.query as Record<string, unknown>);
  return sendSuccess(res, 200, result, "Sales fetched successfully");
});

export const getSale = asyncHandler(async (req: Request, res: Response) => {
  const sale = await saleService.getSaleById(req.params.id);
  return sendSuccess(res, 200, sale, "Sale fetched successfully");
});
