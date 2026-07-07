import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import * as roleService from "./role.service";

export const getRoles = asyncHandler(async (_req: Request, res: Response) => {
  const roles = await roleService.listRoles();
  return sendSuccess(res, 200, roles, "Roles fetched successfully");
});

export const getPermissions = asyncHandler(async (_req: Request, res: Response) => {
  const permissions = await roleService.listPermissions();
  return sendSuccess(res, 200, permissions, "Permissions fetched successfully");
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const role = await roleService.updateRolePermissions(req.params.name, req.body.permissions);
  return sendSuccess(res, 200, role, "Role updated successfully");
});
