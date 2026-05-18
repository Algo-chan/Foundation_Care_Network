"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyLabResults = exports.updateLabResult = exports.createLabOrder = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const createLabOrder = async (req, res, next) => {
    try {
        const doctorUserId = req.user?.userId;
        const { patientId, testName } = req.body;
        const doctor = await prisma_1.default.doctor.findUnique({ where: { userId: doctorUserId } });
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor profile not found' });
        }
        const labOrder = await prisma_1.default.labResult.create({
            data: {
                doctorId: doctor.id,
                patientId,
                testName,
                status: 'PENDING',
            },
        });
        res.status(201).json({ success: true, data: labOrder });
    }
    catch (error) {
        next(error);
    }
};
exports.createLabOrder = createLabOrder;
const updateLabResult = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { resultValue, unit, labName } = req.body;
        const labResult = await prisma_1.default.labResult.update({
            where: { id },
            data: {
                resultValue,
                unit,
                labName,
                status: 'COMPLETED',
                completedAt: new Date(),
            },
        });
        res.json({ success: true, data: labResult });
    }
    catch (error) {
        next(error);
    }
};
exports.updateLabResult = updateLabResult;
const getMyLabResults = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;
        let labResults;
        if (role === 'PATIENT') {
            const patient = await prisma_1.default.patient.findUnique({ where: { userId } });
            labResults = await prisma_1.default.labResult.findMany({
                where: { patientId: patient?.id },
                include: { doctor: { include: { user: { select: { name: true } } } } },
                orderBy: { orderedAt: 'desc' }
            });
        }
        else if (role === 'DOCTOR') {
            const doctor = await prisma_1.default.doctor.findUnique({ where: { userId } });
            labResults = await prisma_1.default.labResult.findMany({
                where: { doctorId: doctor?.id },
                include: { patient: { include: { user: { select: { name: true } } } } },
                orderBy: { orderedAt: 'desc' }
            });
        }
        res.json({ success: true, data: labResults });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyLabResults = getMyLabResults;
