import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { UserRole } from "../modules/user/user.types";

interface JwtPayload {
  sub: string;
  role: UserRole;
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Authentication token missing"));
  }

  const token = header.split(" ")[1];
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(ApiError.internal("JWT secret not configured"));
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired token"));
  }
}
