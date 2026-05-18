"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const user_1 = require("shared/src/schemas/user");
const getProfile = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            include: {
                patient: true,
                doctor: { include: { hospital: true } },
                nurse: true,
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: { code: 'USER_NOT_FOUND', message: 'User not found', status: 404 }
            });
        }
        res.json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;
        // 1. Update Base User Info
        const baseData = user_1.updateProfileSchema.parse(req.body);
        const cleanData = {};
        for (const [key, val] of Object.entries(baseData)) {
            if (val !== null)
                cleanData[key] = val;
        }
        await prisma_1.default.user.update({
            where: { id: userId },
            data: cleanData
        });
        // 2. Update Role-Specific Info
        if (role === 'PATIENT') {
            const patientData = user_1.updatePatientProfileSchema.parse(req.body);
            await prisma_1.default.patient.update({
                where: { userId },
                data: {
                    ...patientData,
                    dateOfBirth: patientData.dateOfBirth ? new Date(patientData.dateOfBirth) : undefined
                }
            });
        }
        else if (role === 'DOCTOR') {
            const doctorData = user_1.updateDoctorProfileSchema.parse(req.body);
            await prisma_1.default.doctor.update({
                where: { userId },
                data: doctorData
            });
        }
        else if (role === 'NURSE') {
            const nurseData = user_1.updateNurseProfileSchema.parse(req.body);
            await prisma_1.default.nurse.update({
                where: { userId },
                data: nurseData
            });
        }
        res.json({ success: true, message: 'Profile updated successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
