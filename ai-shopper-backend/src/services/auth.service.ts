import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { registerSchema, loginSchema } from "../validators/auth.validator";
import { AppError } from "../utils/AppError";
import { UserRepository } from "../repositories/user.repository";
import { RegisterDto, LoginDto, AuthResultDto } from "../dto/auth.dto";

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async registerUser(data: RegisterDto): Promise<AuthResultDto> {
    const parsed = registerSchema.parse(data);

    const exists = await this.userRepository.findByEmail(parsed.email);
    if (exists) {
      throw new AppError(400, "Email already exists");
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 10);

    const user = await this.userRepository.create({
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
  }

  async loginUser(data: LoginDto): Promise<AuthResultDto> {
    const parsed = loginSchema.parse(data);

    const user = await this.userRepository.findByEmail(parsed.email);
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
    await this.userRepository.save(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    };
  }

  async refreshUserToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
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

    const user = await this.userRepository.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError(401, "Invalid refresh token");
    }

    const newAccessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = newRefreshToken;
    await this.userRepository.save(user);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async getCurrentUser(userId: string): Promise<AuthResultDto["user"]> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };
  }
}