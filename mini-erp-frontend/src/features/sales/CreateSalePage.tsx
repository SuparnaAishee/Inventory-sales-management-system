import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProducts } from "@/api/product.api";
import { createSale } from "@/api/sale.api";
import { getApiErrorMessage } from "@/api/axiosClient";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

interface SaleLine {
  productId: string;
  quantity: number;
}

export function CreateSalePage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: productsResult, isLoading } = useQuery({
    queryKey: ["products-for-sale"],
    queryFn: () => fetchProducts({ limit: 100 }),
  });

  const products = productsResult?.items ?? [];
  const [lines, setLines] = useState<SaleLine[]>([{ productId: "", quantity: 1 }]);

  const productMap = useMemo(() => new Map(products.map((p) => [p._id, p])), [products]);

  const grandTotal = useMemo(() => {
    return lines.reduce((sum, line) => {
      const product = productMap.get(line.productId);
      if (!product) return sum;
      return sum + product.sellingPrice * line.quantity;
    }, 0);
  }, [lines, productMap]);

  const saleMutation = useMutation({
    mutationFn: () =>
      createSale(
        lines
          .filter((l) => l.productId)
          .map((l) => ({ productId: l.productId, quantity: l.quantity }))
      ),
    onSuccess: () => {
      showToast("Sale created successfully");
      setLines([{ productId: "", quantity: 1 }]);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products-for-sale"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err) => showToast(getApiErrorMessage(err, "Failed to create sale"), "error"),
  });

  function updateLine(index: number, patch: Partial<SaleLine>) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  function addLine() {
    setLines((prev) => [...prev, { productId: "", quantity: 1 }]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    const validLines = lines.filter((l) => l.productId && l.quantity > 0);
    if (validLines.length === 0) {
      showToast("Select at least one product", "error");
      return;
    }
    saleMutation.mutate();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create Sale</h1>
        <p className="text-sm text-slate-500">Select products and quantities to record a sale</p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          {isLoading ? (
            <p className="text-sm text-slate-500">Loading products...</p>
          ) : (
            <>
              {lines.map((line, index) => {
                const product = productMap.get(line.productId);
                const subtotal = product ? product.sellingPrice * line.quantity : 0;
                return (
                  <div key={index} className="flex items-end gap-3 border-b border-slate-100 pb-4">
                    <div className="flex flex-1 flex-col gap-1">
                      <label className="text-sm font-medium text-slate-700">Product</label>
                      <select
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        value={line.productId}
                        onChange={(e) => updateLine(index, { productId: e.target.value })}
                      >
                        <option value="">Select a product</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id} disabled={p.stockQuantity === 0}>
                            {p.name} ({p.sku}) — {p.stockQuantity} in stock — $
                            {p.sellingPrice.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex w-28 flex-col gap-1">
                      <label className="text-sm font-medium text-slate-700">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        max={product?.stockQuantity ?? undefined}
                        value={line.quantity}
                        onChange={(e) =>
                          updateLine(index, { quantity: Math.max(Number(e.target.value), 1) })
                        }
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="w-24 text-right text-sm font-medium text-slate-900">
                      ${subtotal.toFixed(2)}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="px-2 py-2 text-red-600"
                      onClick={() => removeLine(index)}
                      disabled={lines.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                );
              })}

              <Button type="button" variant="secondary" onClick={addLine} className="w-fit">
                + Add Product
              </Button>

              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <p className="text-lg font-semibold text-slate-900">
                  Grand Total: ${grandTotal.toFixed(2)}
                </p>
                <Button onClick={handleSubmit} isLoading={saleMutation.isPending}>
                  Complete Sale
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
