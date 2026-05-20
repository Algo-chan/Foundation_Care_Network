import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "../utils/prisma";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/token";
import redis from "../utils/redis";
import { registerSchema, loginSchema } from "../../lib/auth";
import { sendOTPSMS } from "../utils/sms";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: "USER_EXISTS",
          message: "User already exists with this email",
          status: 400,
        },
      });
    }

    const passwordHash = await bcrypt.hash(validatedData.password, 12);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        passwordHash,
        role: validatedData.role,
        isVerified: false,
        isApproved: validatedData.role === "PATIENT", // Patients are auto-approved, others need admin
      },
    });

    // Store OTP in Redis for 10 minutes
    await redis.set(`otp:${user.id}`, otp, "EX", 600);

    // Send OTP via SMS if phone is provided
    if (user.phone) {
      await sendOTPSMS(user.phone, otp);
    }

    res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your phone number.",
      data: { userId: user.id },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_FIELDS", message: "User ID and OTP are required", status: 400 },
      });
    }

    const storedOtp = await redis.get(`otp:${userId}`);

    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_OTP", message: "Invalid or expired OTP", status: 400 },
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });

    await redis.del(`otp:${userId}`);

    res.json({
      success: true,
      message: "Phone number verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const lockoutKey = `lockout:${email}`;
    const attemptsKey = `attempts:${email}`;

    // Check if account is locked
    const isLocked = await redis.get(lockoutKey);
    if (isLocked) {
      return res.status(423).json({
        success: false,
        error: {
          code: "ACCOUNT_LOCKED",
          message:
            "Account locked due to too many failed attempts. Try again in 15 minutes.",
          status: 423,
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
          status: 401,
        },
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        error: {
          code: "UNVERIFIED",
          message: "Please verify your email first",
          status: 403,
        },
      });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        error: {
          code: "NOT_APPROVED",
          message: "Your account is pending admin approval",
          status: 403,
        },
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      // Increment failed attempts
      const attempts = await redis.incr(attemptsKey);
      if (attempts === 1) {
        await redis.expire(attemptsKey, 900); // 15 minutes window
      }

      if (attempts >= 5) {
        await redis.set(lockoutKey, "locked", "EX", 900); // Lock for 15 minutes
        await redis.del(attemptsKey);
        return res.status(423).json({
          success: false,
          error: {
            code: "ACCOUNT_LOCKED",
            message:
              "Account locked due to too many failed attempts. Try again in 15 minutes.",
            status: 423,
          },
        });
      }

      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: `Invalid email or password. ${5 - attempts} attempts remaining.`,
          status: 401,
        },
      });
    }

    // Success - Clear attempts
    await redis.del(attemptsKey);

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Store refresh token in httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      data: {
        token: accessToken,
        user: { id: user.id, name: user.name, role: user.role },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: {
          code: "NO_TOKEN",
          message: "No refresh token provided",
          status: 401,
        },
      });
    }

    const payload: any = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
          status: 401,
        },
      });
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
    });

    res.json({
      success: true,
      data: { token: accessToken },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid or expired refresh token",
        status: 401,
      },
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out successfully" });
};
// Internal register function (to be called by admin or seed)
export const registerUser = async (data: z.infer<typeof registerSchema>) => {
  const validatedData = registerSchema.parse(data);

  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.email },
  });

  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  const passwordHash = await bcrypt.hash(validatedData.password, 12);

  const user = await prisma.user.create({
    data: {
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      passwordHash,
      role: validatedData.role,
      isApproved: true,
      isVerified: true,
      patient:
        validatedData.role === "PATIENT"
          ? {
              create: {
                dateOfBirth: new Date(0),
              },
            }
          : undefined,
      doctor:
        validatedData.role === "DOCTOR"
          ? {
              create: {
                specialty: "Pending",
                licenseNumber: `TEMP-${Date.now()}`,
                hospitalId: "dire-dawa-main-hospital",
              },
            }
          : undefined,
      nurse:
        validatedData.role === "NURSE"
          ? {
              create: {},
            }
          : undefined,
    },
  });

  return user;
};
