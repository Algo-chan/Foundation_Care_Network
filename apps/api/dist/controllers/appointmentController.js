"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppointmentStatus = exports.getMyAppointments = exports.createAppointment = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const createAppointment = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const { doctorId, scheduledAt, type } = req.body;
        const patient = await prisma_1.default.patient.findUnique({ where: { userId } });
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient profile not found' });
        }
        const appointment = await prisma_1.default.appointment.create({
            data: {
                patientId: patient.id,
                doctorId,
                scheduledAt: new Date(scheduledAt),
                type,
                status: 'PENDING',
            },
        });
        res.status(201).json({ success: true, data: appointment });
    }
    catch (error) {
        next(error);
    }
};
exports.createAppointment = createAppointment;
const getMyAppointments = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;
        let appointments;
        if (role === 'PATIENT') {
            const patient = await prisma_1.default.patient.findUnique({ where: { userId } });
            appointments = await prisma_1.default.appointment.findMany({
                where: { patientId: patient?.id },
                include: { doctor: { include: { user: { select: { name: true } } } } },
                orderBy: { scheduledAt: 'asc' }
            });
        }
        else if (role === 'DOCTOR') {
            const doctor = await prisma_1.default.doctor.findUnique({ where: { userId } });
            appointments = await prisma_1.default.appointment.findMany({
                where: { doctorId: doctor?.id },
                include: { patient: { include: { user: { select: { name: true } } } } },
                orderBy: { scheduledAt: 'asc' }
            });
        }
        res.json({ success: true, data: appointments });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyAppointments = getMyAppointments;
const updateAppointmentStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const appointment = await prisma_1.default.appointment.update({
            where: { id },
            data: { status },
        });
        res.json({ success: true, data: appointment });
    }
    catch (error) {
        next(error);
    }
};
exports.updateAppointmentStatus = updateAppointmentStatus;
