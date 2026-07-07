import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/features/auth/LoginPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { ProductsPage } from "@/features/products/ProductsPage";
import { CreateSalePage } from "@/features/sales/CreateSalePage";
import { RolesPage } from "@/features/roles/RolesPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/sales/new" element={<CreateSalePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute requiredPermission="roles:manage" />}>
        <Route element={<AppLayout />}>
          <Route path="/roles" element={<RolesPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
