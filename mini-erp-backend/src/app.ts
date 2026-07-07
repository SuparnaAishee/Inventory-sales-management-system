import cors from "cors";
import path from "path";
import express, { Application } from "express";
import authRoutes from "./modules/auth/auth.routes";
import productRoutes from "./modules/product/product.routes";
import saleRoutes from "./modules/sale/sale.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import roleRoutes from "./modules/rbac/role.routes";
import { globalErrorHandler, notFoundHandler } from "./middleware/errorHandler";

export function createApp(): Application {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(",") ?? "*",
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

  app.get("/health", (_req, res) => {
    res.status(200).json({ success: true, message: "OK" });
  });

  const API_PREFIX = "/api/v1";
  app.use(`${API_PREFIX}/auth`, authRoutes);
  app.use(`${API_PREFIX}/products`, productRoutes);
  app.use(`${API_PREFIX}/sales`, saleRoutes);
  app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
  app.use(`${API_PREFIX}/roles`, roleRoutes);

  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
