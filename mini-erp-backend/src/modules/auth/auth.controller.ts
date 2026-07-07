import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { loginUser } from "./auth.service";
import { User } from "../user/user.model";
import { getPermissionsForRole } from "../rbac/role.service";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await loginUser(email, password);
  return sendSuccess(res, 200, result, "Login successful");
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  const permissions = await getPermissionsForRole(user.role);
  return sendSuccess(
    res,
    200,
    { id: user.id, name: user.name, email: user.email, role: user.role, permissions },
    "Current user fetched"
  );
});
