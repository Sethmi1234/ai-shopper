import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { ZodError } from "zod";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle specific AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Handle Zod Validation Errors
  if (err instanceof ZodError || err.name === "ZodError") {
    return res.status(400).json({
      message: "Validation error",
      errors: err.errors,
    });
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  // Handle JWT errors
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token expired" });
  }
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Invalid token" });
  }

  // Handle generic error structure manually thrown previously, just in case
  if (err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Default to 500 internal server error
  console.error("Unhandled Error:", err);
  return res.status(500).json({ message: "Internal server error" });
};
