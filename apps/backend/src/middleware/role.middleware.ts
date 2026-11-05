
import { RequestHandler } from "express";
import { UserRole } from "../utils/jwt";
import { sendError } from "../utils/api-response";

export const authorize = (
  ...allowedRoles: UserRole[]
): RequestHandler => {
  return (req, res, next) => {
    // Authentication must run before authorization.
    if (!req.auth) {
      return sendError(
        res,
        "Authentication required",
        401
      );
    }

    // Check whether the user's role is permitted.
    if (!allowedRoles.includes(req.auth.role)) {
      return sendError(
        res,
        "You do not have permission to access this resource",
        403
      );
    }

    next();
  };
};
