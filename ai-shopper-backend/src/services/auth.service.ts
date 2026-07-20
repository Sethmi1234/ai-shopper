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
    throw Object.assign(new Error("Email already exists"), { statusCode: 400 });
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
    throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
  }

  const match = await bcrypt.compare(parsed.password, user.password);
  if (!match) {
    throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
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
    throw Object.assign(new Error("Refresh token is required"), { statusCode: 400 });
  }

  let decoded: { id: string };
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as { id: string };
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw Object.assign(new Error("Refresh token expired"), { statusCode: 401 });
    }
    throw Object.assign(new Error("Invalid refresh token"), { statusCode: 401 });
  }

  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== refreshToken) {
    throw Object.assign(new Error("Invalid refresh token"), { statusCode: 401 });
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
    throw Object.assign(new Error("User not found"), { statusCode: 404 });
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
};