import { Router } from "express";
import * as productController from "./product.controller";
import {
  createProductValidation,
  productIdValidation,
  updateProductValidation,
} from "./product.validation";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { upload } from "../../middleware/upload";

const router = Router();

router.use(authenticate);

router.get("/", productController.getProducts);
router.get("/:id", productIdValidation, validate, productController.getProduct);

router.post(
  "/",
  authorize("admin", "manager"),
  upload.single("image"),
  createProductValidation,
  validate,
  productController.createProduct
);

router.put(
  "/:id",
  authorize("admin", "manager"),
  upload.single("image"),
  updateProductValidation,
  validate,
  productController.updateProduct
);

router.delete(
  "/:id",
  authorize("admin", "manager"),
  productIdValidation,
  validate,
  productController.deleteProduct
);

export default router;
