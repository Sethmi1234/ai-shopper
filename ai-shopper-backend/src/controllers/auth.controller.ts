import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  registerUser,
  loginUser,
  refreshUserToken,
  getCurrentUser,
} from "../services/auth.service";

// REGISTER
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json({
      message: "User created",
      user: result.user,
    });
  } catch (error: any) {
    next(error);
  }
};

// LOGIN
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await loginUser(req.body);
    res.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (error: any) {
    next(error);
  }
};

// REFRESH TOKEN
export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const result = await refreshUserToken(refreshToken);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
};

// GET CURRENT USER (ME)
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await getCurrentUser(req.user!.id);
    res.json({ user });
  } catch (error: any) {
    next(error);
  }
};