"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDoctorById = exports.getAvailableDoctors = exports.updateLocation = exports.toggleAvailability = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const doctorService_1 = require("../services/doctorService");
const socketService_1 = require("../services/socketService");
const toggleAvailability = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const doctor = await prisma_1.default.doctor.findUnique({
            where: { userId },
        });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                error: { code: 'DOCTOR_NOT_FOUND', message: 'Doctor profile not found', status: 404 }
            });
        }
        const updatedDoctor = await prisma_1.default.doctor.update({
            where: { userId },
            data: { isAvailable: !doctor.isAvailable },
        });
        (0, socketService_1.emitDoctorAvailabilityChange)(doctor.id, updatedDoctor.isAvailable);
        res.json({
            success: true,
            message: `Availability turned ${updatedDoctor.isAvailable ? 'ON' : 'OFF'}`,
            data: { isAvailable: updatedDoctor.isAvailable }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.toggleAvailability = toggleAvailability;
const updateLocation = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const { lat, lng } = req.body;
        if (lat === undefined || lng === undefined) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_INPUT', message: 'Latitude and Longitude are required', status: 400 }
            });
        }
        await prisma_1.default.doctor.update({
            where: { userId },
            data: {
                lastLat: parseFloat(lat),
                lastLng: parseFloat(lng)
            },
        });
        res.json({
            success: true,
            message: 'Location updated successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateLocation = updateLocation;
const getAvailableDoctors = async (req, res, next) => {
    try {
        const { specialty, hospitalId } = req.query;
        const doctors = await prisma_1.default.doctor.findMany({
            where: {
                isAvailable: true,
                user: { isApproved: true },
                specialty: specialty ? String(specialty) : undefined,
                hospitalId: hospitalId ? String(hospitalId) : undefined,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        phone: true,
                    }
                },
                hospital: true,
            }
        });
        const doctorsWithMeta = await Promise.all(doctors.map(async (doc) => {
            const waitMinutes = await (0, doctorService_1.calculateWaitTime)(doc.id);
            const nextSlot = await (0, doctorService_1.getNextAvailableSlot)(doc.id);
            return {
                ...doc,
                waitTime: (0, doctorService_1.formatWaitTime)(waitMinutes),
                waitMinutes,
                nextAvailableSlot: nextSlot,
            };
        }));
        res.json({ success: true, data: doctorsWithMeta });
    }
    catch (error) {
        next(error);
    }
};
exports.getAvailableDoctors = getAvailableDoctors;
const getDoctorById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const doctor = await prisma_1.default.doctor.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, phone: true, email: true } },
                hospital: true,
            },
        });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                error: { code: 'DOCTOR_NOT_FOUND', message: 'Doctor not found', status: 404 }
            });
        }
        const waitMinutes = await (0, doctorService_1.calculateWaitTime)(doctor.id);
        const nextSlot = await (0, doctorService_1.getNextAvailableSlot)(doctor.id);
        res.json({
            success: true,
            data: {
                ...doctor,
                waitTime: (0, doctorService_1.formatWaitTime)(waitMinutes),
                waitMinutes,
                nextAvailableSlot: nextSlot,
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDoctorById = getDoctorById;
