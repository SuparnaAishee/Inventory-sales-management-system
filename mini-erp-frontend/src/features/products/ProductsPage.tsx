import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from "@/api/product.api";
import type { ProductFormInput } from "@/api/product.api";
import { getApiErrorMessage } from "@/api/axiosClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { ProductFormDialog } from "./ProductFormDialog";
import type { ProductFormValues } from "./ProductFormDialog";
import type { Product } from "@/types";

const PAGE_SIZE = 10;

export function ProductsPage() {
  const { user } = useAuth();
  const canManage = user?.permissions?.includes("products:manage") ?? false;
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", { search, page }],
    queryFn: () => fetchProducts({ search, page, limit: PAGE_SIZE }),
  });

  const invalidateProducts = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
  };

  const createMutation = useMutation({
    mutationFn: (input: ProductFormInput) => createProduct(input),
    onSuccess: () => {
      showToast("Product created successfully");
      setIsFormOpen(false);
      invalidateProducts();
    },
    onError: (err) => showToast(getApiErrorMessage(err, "Failed to create product"), "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProductFormInput }) =>
      updateProduct(id, input),
    onSuccess: () => {
      showToast("Product updated successfully");
      setIsFormOpen(false);
      setEditingProduct(null);
      invalidateProducts();
    },
    onError: (err) => showToast(getApiErrorMessage(err, "Failed to update product"), "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      showToast("Product deleted successfully");
      invalidateProducts();
    },
    onError: (err) => showToast(getApiErrorMessage(err, "Failed to delete product"), "error"),
  });

  async function handleFormSubmit(values: ProductFormValues) {
    if (editingProduct) {
      await updateMutation.mutateAsync({ id: editingProduct._id, input: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  }

  function handleDelete(product: Product) {
    if (window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(product._id);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Products</h1>
          <p className="text-sm text-stone-500">Manage your inventory</p>
        </div>
        {canManage && (
          <Button
            onClick={() => {
              setEditingProduct(null);
              setIsFormOpen(true);
            }}
          >
            + Add Product
          </Button>
        )}
      </div>

      <Input
        placeholder="Search by name, SKU, or category..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="max-w-sm"
      />

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner className="h-8" />
            </div>
          ) : isError || !data ? (
            <p className="text-sm text-red-600">Failed to load products.</p>
          ) : data.items.length === 0 ? (
            <p className="text-sm text-stone-500">No products found.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead>
                    <tr className="border-b-2 border-stone-200 text-xs uppercase tracking-widest text-stone-500">
                      <th className="py-2 pr-4 font-semibold">Image</th>
                      <th className="py-2 pr-4 font-semibold">Name</th>
                      <th className="py-2 pr-4 font-semibold">SKU</th>
                      <th className="py-2 pr-4 font-semibold">Category</th>
                      <th className="py-2 pr-4 font-semibold">Price</th>
                      <th className="py-2 pr-4 font-semibold">Stock</th>
                      {canManage && <th className="py-2 pr-4 font-semibold">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((product) => (
                      <tr key={product._id} className="border-b border-stone-100 hover:bg-stone-50">
                        <td className="py-2 pr-4">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-10 w-10 rounded-md border border-stone-200 object-cover"
                          />
                        </td>
                        <td className="py-2 pr-4 font-medium text-stone-900">{product.name}</td>
                        <td className="py-2 pr-4 font-mono text-stone-600">{product.sku}</td>
                        <td className="py-2 pr-4 text-stone-600">{product.category}</td>
                        <td className="py-2 pr-4 font-mono tabular-nums text-stone-600">
                          ${product.sellingPrice.toFixed(2)}
                        </td>
                        <td className="py-2 pr-4">
                          <Badge tone={product.stockQuantity < 5 ? "danger" : "success"}>
                            {product.stockQuantity}
                          </Badge>
                        </td>
                        {canManage && (
                          <td className="flex gap-2 py-2 pr-4">
                            <Button
                              variant="ghost"
                              className="px-2 py-1"
                              onClick={() => {
                                setEditingProduct(product);
                                setIsFormOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              className="px-2 py-1"
                              onClick={() => handleDelete(product)}
                            >
                              Delete
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-stone-600">
                <p>
                  Page {data.page} of {data.totalPages} ({data.total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    disabled={data.page <= 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={data.page >= data.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {isFormOpen && (
        <ProductFormDialog
          open={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
          }}
          onSubmit={handleFormSubmit}
          initialProduct={editingProduct}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
