import { Router } from "express";
import { getMe, login } from "./auth.controller";
import { loginValidation } from "./auth.validation";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

router.post("/login", loginValidation, validate, login);
router.get("/me", authenticate, getMe);

export default router;
