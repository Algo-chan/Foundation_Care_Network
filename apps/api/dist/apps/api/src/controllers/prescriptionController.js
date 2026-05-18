"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyPrescriptions = exports.createPrescription = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const createPrescription = async (req, res, next) => {
    try {
        const doctorUserId = req.user?.userId;
        const { patientId, medications, notes, expiresAt, pharmacyId } = req.body;
        // Get doctor profile id
        const doctor = await prisma_1.default.doctor.findUnique({ where: { userId: doctorUserId } });
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor profile not found' });
        }
        const prescription = await prisma_1.default.prescription.create({
            data: {
                doctorId: doctor.id,
                patientId,
                medications,
                notes,
                expiresAt: expiresAt ? new Date(expiresAt) : undefined,
                pharmacyId,
            },
        });
        res.status(201).json({ success: true, data: prescription });
    }
    catch (error) {
        next(error);
    }
};
exports.createPrescription = createPrescription;
const getMyPrescriptions = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;
        let prescriptions;
        if (role === 'PATIENT') {
            const patient = await prisma_1.default.patient.findUnique({ where: { userId } });
            prescriptions = await prisma_1.default.prescription.findMany({
                where: { patientId: patient?.id },
                include: { doctor: { include: { user: { select: { name: true } } } } },
                orderBy: { issuedAt: 'desc' }
            });
        }
        else if (role === 'DOCTOR') {
            const doctor = await prisma_1.default.doctor.findUnique({ where: { userId } });
            prescriptions = await prisma_1.default.prescription.findMany({
                where: { doctorId: doctor?.id },
                include: { patient: { include: { user: { select: { name: true } } } } },
                orderBy: { issuedAt: 'desc' }
            });
        }
        res.json({ success: true, data: prescriptions });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyPrescriptions = getMyPrescriptions;
