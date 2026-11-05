import { Response } from "express";

interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

interface ErrorResponse {
  success: false;
  message: string;
  errors?: unknown;
}

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data: T,
  statusCode = 200
) => {
  const response: SuccessResponse<T> = {
    success: true,
    message,
    data,
  };

  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown
) => {
  const response: ErrorResponse = {
    success: false,
    message,
    ...(errors !== undefined && { errors }),
  };

  return res.status(statusCode).json(response);
};