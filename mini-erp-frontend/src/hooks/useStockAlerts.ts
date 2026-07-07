import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createSocket } from "@/lib/socket";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";

interface StockLowPayload {
  id: string;
  name: string;
  sku: string;
  stockQuantity: number;
}

/**
 * Live low-stock alerts over Socket.IO — the backend emits `stock:low`
 * the moment a sale pushes a product under the threshold, so every
 * connected user sees it immediately instead of on next page refresh.
 */
export function useStockAlerts() {
  const { token, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = createSocket(token);

    socket.on("stock:low", (product: StockLowPayload) => {
      showToast(`Low stock: ${product.name} (${product.sku}) — ${product.stockQuantity} left`, "warning");
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, token, showToast, queryClient]);
}
