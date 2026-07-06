import { ApiError } from "../../utils/ApiError";
import { queryCollection } from "../../utils/queryBuilder";
import { Product } from "../product/product.model";
import { Sale } from "./sale.model";

interface SaleItemInput {
  productId: string;
  quantity: number;
}

export async function createSale(items: SaleItemInput[], userId: string) {
  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Validate all items before mutating any stock, so a bad item fails the
  // whole request instead of leaving stock partially decremented.
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw ApiError.notFound(`Product not found: ${item.productId}`);
    }
    if (product.stockQuantity < item.quantity) {
      throw ApiError.badRequest(
        `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, requested: ${item.quantity}`
      );
    }
  }

  const saleItems = items.map((item) => {
    const product = productMap.get(item.productId)!;
    const subtotal = product.sellingPrice * item.quantity;
    return {
      product: product._id,
      quantity: item.quantity,
      priceAtSale: product.sellingPrice,
      subtotal,
    };
  });

  const grandTotal = saleItems.reduce((sum, item) => sum + item.subtotal, 0);

  await Promise.all(
    items.map((item) =>
      Product.updateOne(
        { _id: item.productId },
        { $inc: { stockQuantity: -item.quantity } }
      )
    )
  );

  const sale = await Sale.create({
    items: saleItems,
    grandTotal,
    createdBy: userId,
  });

  return sale.populate("items.product", "name sku category");
}

export async function listSales(rawQuery: Record<string, unknown>) {
  return queryCollection(Sale, rawQuery, {
    defaultSort: "-createdAt",
    defaultLimit: 10,
  });
}

export async function getSaleById(id: string) {
  const sale = await Sale.findById(id).populate("items.product", "name sku category");
  if (!sale) {
    throw ApiError.notFound("Sale not found");
  }
  return sale;
}
