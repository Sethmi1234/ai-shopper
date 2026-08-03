import { Request, Response, NextFunction } from "express";
import { encryptData } from "../utils/encryption";

export const encryptMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json.bind(res);

  res.json = function (body: any) {
    // Skip if already encrypted or if body is null/undefined
    if (!body || body.payload) {
      return originalJson(body);
    }

    try {
      const encrypted = encryptData(body);
      return originalJson({ payload: encrypted });
    } catch (error) {
      console.error("Encryption failed:", error);
      // If encryption fails, send the original body
      return originalJson(body);
    }
  };

  next();
};
