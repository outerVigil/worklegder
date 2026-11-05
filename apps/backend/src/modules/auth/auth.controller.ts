
import { RequestHandler } from "express";
import { env } from "../../config/env";
import { sendError, sendSuccess } from "../../utils/api-response";
import { loginUser } from "./auth.service";

const REFRESH_TOKEN_MAX_AGE =
  7 * 24 * 60 * 60 * 1000;

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { identifier, password } =
      res.locals.validated.body as {
        identifier: string;
        password: string;
      };

    const metadata = {
      ...(req.ip !== undefined && { ipAddress: req.ip }),
      ...(req.get("user-agent") !== undefined && {
        userAgent: req.get("user-agent")!,
      }),
    };

    const result = await loginUser(
      { identifier, password },
      metadata
    );

    if (!result) {
      return sendError(
        res,
        "Invalid credentials or inactive account",
        401
      );
    }

    // Refresh token is stored in an HttpOnly cookie.
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/v1/auth",
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    // Do not expose the refresh token in the JSON response.
    return sendSuccess(
      res,
      "Login successful",
      {
        accessToken: result.accessToken,
        user: result.user,
      }
    );
  } catch (error) {
    next(error);
  }
};
