import { Router } from "express";
import { getStats } from "./dashboard.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { PERMISSIONS } from "../rbac/permission.constants";

const router = Router();

router.get("/stats", authenticate, authorize(PERMISSIONS.DASHBOARD_VIEW), getStats);

export default router;
