"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = exports.approveUser = exports.createUser = exports.getUsers = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const authController_1 = require("./authController");
const getUsers = async (req, res, next) => {
    try {
        const { role, isApproved, search } = req.query;
        const users = await prisma_1.default.user.findMany({
            where: {
                role: role ? role : undefined,
                isApproved: isApproved !== undefined ? isApproved === 'true' : undefined,
                OR: search ? [
                    { name: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search } },
                    { email: { contains: search, mode: 'insensitive' } },
                ] : undefined
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                role: true,
                isVerified: true,
                isApproved: true,
                createdAt: true
            }
        });
        res.json({ success: true, data: users });
    }
    catch (error) {
        next(error);
    }
};
exports.getUsers = getUsers;
const createUser = async (req, res, next) => {
    try {
        const user = await (0, authController_1.registerUser)(req.body);
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: { code: 'CREATE_FAILED', message: error.message, status: 400 }
        });
    }
};
exports.createUser = createUser;
const approveUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await prisma_1.default.user.update({
            where: { id },
            data: { isApproved: true },
        });
        res.json({
            success: true,
            message: `User ${user.name} approved successfully`,
            data: { id: user.id, isApproved: user.isApproved }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.approveUser = approveUser;
const getStats = async (req, res, next) => {
    try {
        const [totalUsers, doctorsCount, nursesCount, patientsCount, pendingApprovals, hospitalsCount, pharmaciesCount, recentLogs, criticalVitals] = await Promise.all([
            prisma_1.default.user.count(),
            prisma_1.default.user.count({ where: { role: 'DOCTOR' } }),
            prisma_1.default.user.count({ where: { role: 'NURSE' } }),
            prisma_1.default.user.count({ where: { role: 'PATIENT' } }),
            prisma_1.default.user.count({ where: { isApproved: false } }),
            prisma_1.default.hospital.count(),
            prisma_1.default.pharmacy.count(),
            prisma_1.default.auditLog.findMany({
                take: 5,
                orderBy: { timestamp: 'desc' },
                include: { user: { select: { name: true } } }
            }),
            prisma_1.default.vitals.count({
                where: {
                    triageResult: {
                        path: ['priority'],
                        equals: 'CRITICAL'
                    }
                }
            })
        ]);
        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    doctors: doctorsCount,
                    nurses: nursesCount,
                    patients: patientsCount,
                    pendingApprovals
                },
                entities: {
                    hospitals: hospitalsCount,
                    pharmacies: pharmaciesCount
                },
                metrics: {
                    criticalFlags: criticalVitals,
                    patientReach: patientsCount,
                    satisfaction: 4.8,
                    avgResponse: '12m'
                },
                recentLogs
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStats = getStats;
