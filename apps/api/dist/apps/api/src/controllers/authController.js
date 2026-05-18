"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = exports.logout = exports.refresh = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const token_1 = require("../utils/token");
const redis_1 = __importDefault(require("../utils/redis"));
const auth_1 = require("shared/src/schemas/auth");
const login = async (req, res, next) => {
    try {
        const { email, password } = auth_1.loginSchema.parse(req.body);
        const lockoutKey = `lockout:${email}`;
        const attemptsKey = `attempts:${email}`;
        // Check if account is locked
        const isLocked = await redis_1.default.get(lockoutKey);
        if (isLocked) {
            return res.status(423).json({
                success: false,
                error: { code: 'ACCOUNT_LOCKED', message: 'Account locked due to too many failed attempts. Try again in 15 minutes.', status: 423 }
            });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { email }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', status: 401 }
            });
        }
        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                error: { code: 'UNVERIFIED', message: 'Please verify your email first', status: 403 }
            });
        }
        if (!user.isApproved) {
            return res.status(403).json({
                success: false,
                error: { code: 'NOT_APPROVED', message: 'Your account is pending admin approval', status: 403 }
            });
        }
        const isMatch = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            // Increment failed attempts
            const attempts = await redis_1.default.incr(attemptsKey);
            if (attempts === 1) {
                await redis_1.default.expire(attemptsKey, 900); // 15 minutes window
            }
            if (attempts >= 5) {
                await redis_1.default.set(lockoutKey, 'locked', 'EX', 900); // Lock for 15 minutes
                await redis_1.default.del(attemptsKey);
                return res.status(423).json({
                    success: false,
                    error: { code: 'ACCOUNT_LOCKED', message: 'Account locked due to too many failed attempts. Try again in 15 minutes.', status: 423 }
                });
            }
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_CREDENTIALS', message: `Invalid email or password. ${5 - attempts} attempts remaining.`, status: 401 }
            });
        }
        // Success - Clear attempts
        await redis_1.default.del(attemptsKey);
        const accessToken = (0, token_1.generateAccessToken)({ userId: user.id, role: user.role });
        const refreshToken = (0, token_1.generateRefreshToken)({ userId: user.id });
        // Store refresh token in httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.json({
            success: true,
            data: {
                token: accessToken,
                user: { id: user.id, name: user.name, role: user.role }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const refresh = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                error: { code: 'NO_TOKEN', message: 'No refresh token provided', status: 401 }
            });
        }
        const payload = (0, token_1.verifyRefreshToken)(refreshToken);
        const user = await prisma_1.default.user.findUnique({ where: { id: payload.userId } });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: { code: 'USER_NOT_FOUND', message: 'User not found', status: 401 }
            });
        }
        const accessToken = (0, token_1.generateAccessToken)({ userId: user.id, role: user.role });
        res.json({
            success: true,
            data: { token: accessToken }
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: { code: 'INVALID_TOKEN', message: 'Invalid or expired refresh token', status: 401 }
        });
    }
};
exports.refresh = refresh;
const logout = async (req, res) => {
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
};
exports.logout = logout;
// Internal register function (to be called by admin or seed)
const registerUser = async (data) => {
    const validatedData = auth_1.registerSchema.parse(data);
    const existingUser = await prisma_1.default.user.findUnique({
        where: { email: validatedData.email }
    });
    if (existingUser) {
        throw new Error('User already exists with this email');
    }
    const passwordHash = await bcrypt_1.default.hash(validatedData.password, 12);
    const user = await prisma_1.default.user.create({
        data: {
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone,
            passwordHash,
            role: validatedData.role,
            isApproved: true,
            isVerified: true,
            patient: validatedData.role === 'PATIENT' ? {
                create: {
                    dateOfBirth: new Date(0),
                }
            } : undefined,
            doctor: validatedData.role === 'DOCTOR' ? {
                create: {
                    specialty: 'Pending',
                    licenseNumber: `TEMP-${Date.now()}`,
                    hospitalId: 'dire-dawa-main-hospital'
                }
            } : undefined,
            nurse: validatedData.role === 'NURSE' ? {
                create: {}
            } : undefined
        }
    });
    return user;
};
exports.registerUser = registerUser;
