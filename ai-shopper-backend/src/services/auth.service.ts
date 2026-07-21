import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt";
import {
  registerSchema,
  loginSchema,
} from "../validators/auth.validator";
import { AppError } from "../utils/AppError";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
  };
  accessToken?: string;
  refreshToken?: string;
}

export const registerUser = async (data: RegisterData): Promise<AuthResult> => {
  const parsed = registerSchema.parse(data);

  const exists = await User.findOne({ email: parsed.email });
  if (exists) {
    throw new AppError(400, "Email already exists");
  }

  const hashedPassword = await bcrypt.hash(parsed.password, 10);

  const user = await User.create({
    name: parsed.name,
    email: parsed.email,
    password: hashedPassword,
  });

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  };
};

export const loginUser = async (data: LoginData): Promise<AuthResult> => {
  const parsed = loginSchema.parse(data);

  const user = await User.findOne({ email: parsed.email });
  if (!user) {
    throw new AppError(401, "Invalid credentials");
  }

  const match = await bcrypt.compare(parsed.password, user.password);
  if (!match) {
    throw new AppError(401, "Invalid credentials");
  }

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  };
};

export const refreshUserToken = async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
  if (!refreshToken) {
    throw new AppError(400, "Refresh token is required");
  }

  let decoded: { id: string };
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as { id: string };
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new AppError(401, "Refresh token expired");
    }
    throw new AppError(401, "Invalid refresh token");
  }

  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError(401, "Invalid refresh token");
  }

  const newAccessToken = generateAccessToken(user._id.toString());
  const newRefreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken = newRefreshToken;
  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const getCurrentUser = async (userId: string): Promise<AuthResult["user"]> => {
  const user = await User.findById(userId).select("-password -refreshToken");

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
};