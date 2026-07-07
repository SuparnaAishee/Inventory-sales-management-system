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
import { PERMISSIONS } from "../rbac/permission.constants";

const router = Router();

router.use(authenticate);

router.get("/", authorize(PERMISSIONS.PRODUCTS_VIEW), productController.getProducts);
router.get(
  "/:id",
  authorize(PERMISSIONS.PRODUCTS_VIEW),
  productIdValidation,
  validate,
  productController.getProduct
);

router.post(
  "/",
  authorize(PERMISSIONS.PRODUCTS_MANAGE),
  upload.single("image"),
  createProductValidation,
  validate,
  productController.createProduct
);

router.put(
  "/:id",
  authorize(PERMISSIONS.PRODUCTS_MANAGE),
  upload.single("image"),
  updateProductValidation,
  validate,
  productController.updateProduct
);

router.delete(
  "/:id",
  authorize(PERMISSIONS.PRODUCTS_MANAGE),
  productIdValidation,
  validate,
  productController.deleteProduct
);

export default router;
