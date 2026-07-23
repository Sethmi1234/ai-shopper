import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  registerUser,
  loginUser,
  refreshUserToken,
  getCurrentUser,
} from "../services/auth.service";

const setRefreshTokenCookie = (res: Response, token?: string) => {
  if (token) {
    res.cookie("refreshToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
};

// REGISTER
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await registerUser(req.body);
    setRefreshTokenCookie(res, result.refreshToken);
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
    setRefreshTokenCookie(res, result.refreshToken);
    res.json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error: any) {
    next(error);
  }
};

// REFRESH TOKEN
export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const result = await refreshUserToken(refreshToken);
    setRefreshTokenCookie(res, result.refreshToken);
    res.json({
      accessToken: result.accessToken,
    });
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