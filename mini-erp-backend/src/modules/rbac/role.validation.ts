import { body, param } from "express-validator";

export const updateRolePermissionsValidation = [
  param("name").isString().trim().notEmpty().withMessage("Role name is required"),
  body("permissions").isArray().withMessage("permissions must be an array"),
  body("permissions.*").isString().withMessage("Each permission must be a string"),
];
