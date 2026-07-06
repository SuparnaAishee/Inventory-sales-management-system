import { ApiError } from "../../utils/ApiError";
import { queryCollection } from "../../utils/queryBuilder";
import { Product } from "./product.model";
import { uploadBufferToCloudinary } from "../../config/cloudinary";

export async function listProducts(rawQuery: Record<string, unknown>) {
  return queryCollection(Product, rawQuery, {
    searchFields: ["name", "sku", "category"],
    filterableFields: ["category"],
    defaultSort: "-createdAt",
    defaultLimit: 10,
  });
}

export async function getProductById(id: string) {
  const product = await Product.findById(id);
  if (!product) {
    throw ApiError.notFound("Product not found");
  }
  return product;
}

interface ProductInput {
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
}

export async function createProduct(
  input: ProductInput,
  imageFile: Express.Multer.File | undefined,
  userId: string
) {
  if (!imageFile) {
    throw ApiError.badRequest("Product image is required");
  }

  const existing = await Product.findOne({ sku: input.sku.toUpperCase() });
  if (existing) {
    throw ApiError.conflict("A product with this SKU already exists");
  }

  const uploaded = await uploadBufferToCloudinary(imageFile.buffer, "mini-erp/products");

  const product = await Product.create({
    ...input,
    imageUrl: uploaded.url,
    imagePublicId: uploaded.publicId,
    createdBy: userId,
  });

  return product;
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
  imageFile: Express.Multer.File | undefined
) {
  const product = await getProductById(id);

  if (input.sku && input.sku.toUpperCase() !== product.sku) {
    const existing = await Product.findOne({ sku: input.sku.toUpperCase() });
    if (existing) {
      throw ApiError.conflict("A product with this SKU already exists");
    }
  }

  Object.assign(product, input);

  if (imageFile) {
    const uploaded = await uploadBufferToCloudinary(imageFile.buffer, "mini-erp/products");
    product.imageUrl = uploaded.url;
    product.imagePublicId = uploaded.publicId;
  }

  await product.save();
  return product;
}

export async function deleteProduct(id: string) {
  const product = await getProductById(id);
  await product.deleteOne();
}
