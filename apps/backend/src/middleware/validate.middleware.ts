
import { RequestHandler } from "express";
import { z } from "zod";
import { sendError } from "../utils/api-response";

type ValidationSchemas = {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
};

export const validate = (
  schemas: ValidationSchemas
): RequestHandler => {
  return (req, res, next) => {
    const validated: Record<string, unknown> = {};

    for (const target of ["body", "params", "query"] as const) {
      const schema = schemas[target];

      if (!schema) continue;

      const result = schema.safeParse(req[target]);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        return sendError(
          res,
          "Validation failed",
          400,
          errors
        );
      }

      validated[target] = result.data;
    }

    res.locals.validated = validated;
    next();
  };
};
