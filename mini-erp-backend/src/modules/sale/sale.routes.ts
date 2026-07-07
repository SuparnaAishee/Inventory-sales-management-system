import { Router } from "express";
import { param } from "express-validator";
import * as saleController from "./sale.controller";
import { createSaleValidation } from "./sale.validation";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { PERMISSIONS } from "../rbac/permission.constants";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize(PERMISSIONS.SALES_CREATE),
  createSaleValidation,
  validate,
  saleController.createSale
);

router.get("/", authorize(PERMISSIONS.SALES_VIEW), saleController.getSales);

router.get(
  "/:id",
  authorize(PERMISSIONS.SALES_VIEW),
  param("id").isMongoId().withMessage("Invalid sale id"),
  validate,
  saleController.getSale
);

export default router;
