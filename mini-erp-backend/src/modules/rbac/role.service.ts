import { ApiError } from "../../utils/ApiError";
import { Permission } from "./permission.model";
import { Role } from "./role.model";

// Role -> permissions lookups happen on every authorize() call, so cache
// them in memory and invalidate on write instead of hitting Mongo per request.
const permissionCache = new Map<string, string[]>();

export function invalidateRoleCache(roleName?: string) {
  if (roleName) {
    permissionCache.delete(roleName.toLowerCase());
  } else {
    permissionCache.clear();
  }
}

export async function getPermissionsForRole(roleName: string): Promise<string[]> {
  const key = roleName.toLowerCase();
  const cached = permissionCache.get(key);
  if (cached) {
    return cached;
  }

  const role = await Role.findOne({ name: key });
  const permissions = role?.permissions ?? [];
  permissionCache.set(key, permissions);
  return permissions;
}

export async function listRoles() {
  return Role.find().sort("name");
}

export async function listPermissions() {
  return Permission.find().sort("key");
}

export async function updateRolePermissions(name: string, permissions: string[]) {
  const uniquePermissions = [...new Set(permissions)];

  const validPermissions = await Permission.find({ key: { $in: uniquePermissions } });
  const validKeys = new Set(validPermissions.map((p) => p.key));
  const invalidKeys = uniquePermissions.filter((key) => !validKeys.has(key));
  if (invalidKeys.length > 0) {
    throw ApiError.badRequest(`Unknown permission key(s): ${invalidKeys.join(", ")}`);
  }

  const role = await Role.findOneAndUpdate(
    { name: name.toLowerCase() },
    { permissions: uniquePermissions },
    { new: true }
  );
  if (!role) {
    throw ApiError.notFound(`Role "${name}" not found`);
  }

  invalidateRoleCache(role.name);
  return role;
}
