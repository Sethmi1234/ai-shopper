import { Request, Response, NextFunction } from "express";
import { decryptData } from "../utils/encryption";

export const decryptMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body.payload === "string") {
    try {
      const decrypted = decryptData(req.body.payload);
      req.body = decrypted;
    } catch (error) {
      console.error("Decryption failed:", error);
      return res.status(400).json({ error: "Invalid payload format" });
    }
  }
  next();
};
