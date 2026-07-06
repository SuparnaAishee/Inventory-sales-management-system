import { axiosClient } from "./axiosClient";
import type { ApiSuccess, Sale } from "@/types";

export interface CreateSaleItemInput {
  productId: string;
  quantity: number;
}

export async function createSale(items: CreateSaleItemInput[]) {
  const { data } = await axiosClient.post<ApiSuccess<Sale>>("/sales", { items });
  return data.data;
}
