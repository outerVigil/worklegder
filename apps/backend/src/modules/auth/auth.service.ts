
import { createHash, randomUUID } from "node:crypto";

import { prisma } from "../../config/prisma";
import { comparePassword } from "../../utils/password";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/jwt";

interface LoginInput {
  identifier: string;
  password: string;
}

interface LoginMetadata {
  ipAddress?: string;
  userAgent?: string;
}

const REFRESH_TOKEN_DAYS = 7;

const hashToken = (token: string): string => {
  return createHash("sha256").update(token).digest("hex");
};

export const loginUser = async (
  input: LoginInput,
  metadata: LoginMetadata = {}
) => {
  const identifier = input.identifier.trim();

  const normalizedEmail = identifier.toLowerCase();

  // Find user using email or employee code.
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: normalizedEmail },
        {
          employee: {
            is: {
              employeeCode: identifier,
            },
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      role: true,
      status: true,

      employee: {
        select: {
          id: true,
          employeeCode: true,
          department: true,
          designation: true,
          employmentStatus: true,
        },
      },
    },
  });

  // Use a generic error to avoid revealing account existence.
  if (!user || user.status !== "ACTIVE") {
    return null;
  }

  // Employees must also have active employment.
  if (
    user.role === "EMPLOYEE" &&
    (!user.employee ||
      user.employee.employmentStatus !== "ACTIVE")
  ) {
    return null;
  }

  const passwordMatches = await comparePassword(
    input.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    return null;
  }

  // Generate tokens.
  const accessToken = generateAccessToken(
    user.id,
    user.role
  );

  const refreshToken = generateRefreshToken(
    user.id,
    user.role
  );

  // Store only the SHA-256 hash of the refresh token.
  const tokenHash = hashToken(refreshToken);

  const familyId = randomUUID();

  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
  );


await prisma.refreshSession.create({
  data: {
    userId: user.id,
    tokenHash,
    familyId,
    expiresAt,
    ...(metadata.ipAddress !== undefined && {
      ipAddress: metadata.ipAddress,
    }),
    ...(metadata.userAgent !== undefined && {
      userAgent: metadata.userAgent,
    }),
  },
});

  // Never return the password hash.
  return {
    accessToken,
    refreshToken,

    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      employee: user.employee
        ? {
            id: user.employee.id,
            employeeCode: user.employee.employeeCode,
            department: user.employee.department,
            designation: user.employee.designation,
          }
        : null,
    },
  };
};
