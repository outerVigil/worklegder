
import { RequestHandler } from "express";
import { prisma } from "../config/prisma";
import { verifyAccessToken } from "../utils/jwt";
import { sendError } from "../utils/api-response";

export const authenticate: RequestHandler = async (
  req,
  res,
  next
) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return sendError(
      res,
      "Authentication token is required",
      401
    );
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return sendError(res, "Invalid authentication token", 401);
  }

  let payload;

  try {
    payload = verifyAccessToken(token);
  } catch {
    return sendError(
      res,
      "Invalid or expired access token",
      401
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status !== "ACTIVE") {
      return sendError(
        res,
        "Your account is inactive or unavailable",
        401
      );
    }

    req.auth = {
      userId: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};
