import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { AuthService } from "../services/auth.service";

export class AuthController {
  constructor(private authService: AuthService) {}

  private setRefreshTokenCookie(res: Response, token?: string) {
    if (token) {
      res.cookie("refreshToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }
  }

  // REGISTER
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.registerUser(req.body);
      this.setRefreshTokenCookie(res, result.refreshToken);
      res.status(201).json({
        message: "User created",
        user: result.user,
      });
    } catch (error: any) {
      next(error);
    }
  };

  // LOGIN
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.loginUser(req.body);
      this.setRefreshTokenCookie(res, result.refreshToken);
      res.json({
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error: any) {
      next(error);
    }
  };

  // REFRESH TOKEN
  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      const result = await this.authService.refreshUserToken(refreshToken);
      this.setRefreshTokenCookie(res, result.refreshToken);
      res.json({
        accessToken: result.accessToken,
      });
    } catch (error: any) {
      next(error);
    }
  };

  // GET CURRENT USER (ME)
  getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await this.authService.getCurrentUser(req.user!.id);
      res.json({ user });
    } catch (error: any) {
      next(error);
    }
  };
}