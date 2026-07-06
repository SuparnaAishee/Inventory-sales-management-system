import { axiosClient } from "./axiosClient";
import type { ApiSuccess, PaginatedResult, Product } from "@/types";

export interface ProductListParams {
  search?: string;
  page?: number;
  limit?: number;
  category?: string;
}

export interface ProductFormInput {
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  image?: File | null;
}

function toFormData(input: ProductFormInput): FormData {
  const formData = new FormData();
  formData.append("name", input.name);
  formData.append("sku", input.sku);
  formData.append("category", input.category);
  formData.append("purchasePrice", String(input.purchasePrice));
  formData.append("sellingPrice", String(input.sellingPrice));
  formData.append("stockQuantity", String(input.stockQuantity));
  if (input.image) {
    formData.append("image", input.image);
  }
  return formData;
}

export async function fetchProducts(params: ProductListParams) {
  const { data } = await axiosClient.get<ApiSuccess<PaginatedResult<Product>>>("/products", {
    params,
  });
  return data.data;
}

export async function fetchProduct(id: string) {
  const { data } = await axiosClient.get<ApiSuccess<Product>>(`/products/${id}`);
  return data.data;
}

export async function createProduct(input: ProductFormInput) {
  const { data } = await axiosClient.post<ApiSuccess<Product>>(
    "/products",
    toFormData(input),
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data.data;
}

export async function updateProduct(id: string, input: ProductFormInput) {
  const { data } = await axiosClient.put<ApiSuccess<Product>>(
    `/products/${id}`,
    toFormData(input),
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data.data;
}

export async function deleteProduct(id: string) {
  await axiosClient.delete(`/products/${id}`);
}
