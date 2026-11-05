
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";

export type UserRole =
  | "SUPER_ADMIN"
  | "SUB_ADMIN"
  | "EMPLOYEE";

export interface TokenPayload {
  sub: string;
  role: UserRole;
}

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

// Generate access token
export const generateAccessToken = (
  userId: string,
  role: UserRole
): string => {
  return jwt.sign(
    { sub: userId, role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

// Generate refresh token
export const generateRefreshToken = (
  userId: string,
  role: UserRole
): string => {
  return jwt.sign(
    { sub: userId, role },
    env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
};

// Verify token and validate its claims
const verifyToken = (
  token: string,
  secret: string
): TokenPayload => {
  const decoded = jwt.verify(token, secret);

  if (
    typeof decoded === "string" ||
    !decoded.sub ||
    !["SUPER_ADMIN", "SUB_ADMIN", "EMPLOYEE"].includes(
      decoded.role as string
    )
  ) {
    throw new Error("Invalid token payload");
  }

  return {
    sub: decoded.sub,
    role: decoded.role as UserRole,
  };
};

// Verify access token
export const verifyAccessToken = (
  token: string
): TokenPayload => {
  return verifyToken(token, env.JWT_ACCESS_SECRET);
};

// Verify refresh token
export const verifyRefreshToken = (
  token: string
): TokenPayload => {
  return verifyToken(token, env.JWT_REFRESH_SECRET);
};
