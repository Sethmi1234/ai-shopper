import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  console.log("Protect middleware called for:", req.originalUrl);
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as { id: string };

    const user = await User.findById(decoded.id).select("-password -refreshToken");

    if (!user) {
      return res.status(401).json({
        message: "User not found.",
      });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({
      message: "Invalid token",
    });
  }
};