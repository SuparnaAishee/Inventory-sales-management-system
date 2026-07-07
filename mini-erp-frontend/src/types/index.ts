export type UserRole = "admin" | "manager" | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
}

export interface Permission {
  _id: string;
  key: string;
  description: string;
}

export interface Role {
  _id: string;
  name: string;
  permissions: string[];
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  product: Product | string;
  quantity: number;
  priceAtSale: number;
  subtotal: number;
}

export interface Sale {
  _id: string;
  items: SaleItem[];
  grandTotal: number;
  createdBy: string;
  createdAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors: unknown[];
}

export interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  lowStockProducts: Product[];
}
