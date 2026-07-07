import { Router } from "express";
import * as roleController from "./role.controller";
import { updateRolePermissionsValidation } from "./role.validation";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { PERMISSIONS } from "./permission.constants";

const router = Router();

router.use(authenticate, authorize(PERMISSIONS.ROLES_MANAGE));

router.get("/", roleController.getRoles);
router.get("/permissions", roleController.getPermissions);
router.put("/:name", updateRolePermissionsValidation, validate, roleController.updateRole);

export default router;
