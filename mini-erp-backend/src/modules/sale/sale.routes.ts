import { Router } from "express";
import { param } from "express-validator";
import * as saleController from "./sale.controller";
import { createSaleValidation } from "./sale.validation";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize("admin", "manager", "employee"),
  createSaleValidation,
  validate,
  saleController.createSale
);

router.get("/", authorize("admin", "manager"), saleController.getSales);

router.get(
  "/:id",
  authorize("admin", "manager"),
  param("id").isMongoId().withMessage("Invalid sale id"),
  validate,
  saleController.getSale
);

export default router;
