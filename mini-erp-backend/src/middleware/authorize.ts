import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { getPermissionsForRole } from "../modules/rbac/role.service";

/**
 * Authorizes by permission key, not role name. The role -> permissions
 * mapping lives in Mongo (see modules/rbac) so admins can change what a
 * role is allowed to do without a code change/redeploy.
 */
export function authorize(...requiredPermissions: string[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(ApiError.unauthorized());
      }
      const grantedPermissions = await getPermissionsForRole(req.user.role);
      const hasPermission = requiredPermissions.some((permission) =>
        grantedPermissions.includes(permission)
      );
      if (!hasPermission) {
        return next(ApiError.forbidden("You do not have permission to perform this action"));
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
