import jwt, { SignOptions } from "jsonwebtoken";
import { ApiError } from "../../utils/ApiError";
import { User } from "../user/user.model";
import { UserRole } from "../user/user.types";
import { getPermissionsForRole } from "../rbac/role.service";

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const token = signToken(user.id, user.role);
  const permissions = await getPermissionsForRole(user.role);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions,
    },
  };
}

export function signToken(userId: string, role: UserRole): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw ApiError.internal("JWT secret not configured");
  }
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "1d") as SignOptions["expiresIn"],
  };
  return jwt.sign({ sub: userId, role }, secret, options);
}
