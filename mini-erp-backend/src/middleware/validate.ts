import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError";

export function validate(req: Request, _res: Response, next: NextFunction) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((e) => ({
      field: "path" in e ? e.path : undefined,
      message: e.msg,
    }));
    return next(ApiError.badRequest("Validation failed", errors));
  }
  next();
}
