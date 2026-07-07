import { useState } from "react";
import type { FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/types";

export interface ProductFormValues {
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  image: File | null;
}

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  initialProduct?: Product | null;
  isSubmitting: boolean;
}

export function ProductFormDialog({
  open,
  onClose,
  onSubmit,
  initialProduct,
  isSubmitting,
}: ProductFormDialogProps) {
  const isEdit = Boolean(initialProduct);
  const [name, setName] = useState(initialProduct?.name ?? "");
  const [sku, setSku] = useState(initialProduct?.sku ?? "");
  const [category, setCategory] = useState(initialProduct?.category ?? "");
  const [purchasePrice, setPurchasePrice] = useState(
    initialProduct ? String(initialProduct.purchasePrice) : ""
  );
  const [sellingPrice, setSellingPrice] = useState(
    initialProduct ? String(initialProduct.sellingPrice) : ""
  );
  const [stockQuantity, setStockQuantity] = useState(
    initialProduct ? String(initialProduct.stockQuantity) : ""
  );
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isEdit && !image) {
      setError("Product image is required");
      return;
    }

    await onSubmit({
      name,
      sku,
      category,
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      stockQuantity: Number(stockQuantity),
      image,
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Product" : "Add Product"}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input label="Product Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="SKU" value={sku} onChange={(e) => setSku(e.target.value)} required />
        <Input label="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Purchase Price"
            type="number"
            numeric
            min={0}
            step="0.01"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            required
          />
          <Input
            label="Selling Price"
            type="number"
            numeric
            min={0}
            step="0.01"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            required
          />
        </div>
        <Input
          label="Stock Quantity"
          type="number"
          numeric
          min={0}
          value={stockQuantity}
          onChange={(e) => setStockQuantity(e.target.value)}
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-stone-700">
            Product Image {!isEdit && <span className="text-red-500">*</span>}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="text-sm text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-stone-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-stone-700 hover:file:bg-stone-200"
          />
          {isEdit && (
            <p className="text-xs text-stone-500">Leave empty to keep the current image.</p>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
