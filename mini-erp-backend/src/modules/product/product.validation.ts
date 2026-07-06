import { body, param } from "express-validator";

export const createProductValidation = [
  body("name").notEmpty().withMessage("Product name is required").trim(),
  body("sku").notEmpty().withMessage("SKU is required").trim(),
  body("category").notEmpty().withMessage("Category is required").trim(),
  body("purchasePrice")
    .notEmpty()
    .withMessage("Purchase price is required")
    .isFloat({ min: 0 })
    .withMessage("Purchase price must be a positive number"),
  body("sellingPrice")
    .notEmpty()
    .withMessage("Selling price is required")
    .isFloat({ min: 0 })
    .withMessage("Selling price must be a positive number"),
  body("stockQuantity")
    .notEmpty()
    .withMessage("Stock quantity is required")
    .isInt({ min: 0 })
    .withMessage("Stock quantity must be a non-negative integer"),
];

export const updateProductValidation = [
  param("id").isMongoId().withMessage("Invalid product id"),
  body("name").optional().notEmpty().withMessage("Product name cannot be empty").trim(),
  body("sku").optional().notEmpty().withMessage("SKU cannot be empty").trim(),
  body("category").optional().notEmpty().withMessage("Category cannot be empty").trim(),
  body("purchasePrice").optional().isFloat({ min: 0 }).withMessage("Purchase price must be a positive number"),
  body("sellingPrice").optional().isFloat({ min: 0 }).withMessage("Selling price must be a positive number"),
  body("stockQuantity").optional().isInt({ min: 0 }).withMessage("Stock quantity must be a non-negative integer"),
];

export const productIdValidation = [param("id").isMongoId().withMessage("Invalid product id")];
