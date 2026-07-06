import { body } from "express-validator";

export const createSaleValidation = [
  body("items").isArray({ min: 1 }).withMessage("At least one product is required"),
  body("items.*.productId").isMongoId().withMessage("Invalid product id"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
];
