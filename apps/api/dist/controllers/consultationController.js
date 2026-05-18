"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateConsultationStatus = exports.getMyConsultations = exports.createConsultation = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const createConsultation = async (req, res, next) => {
    try {
        const requesterId = req.user?.userId;
        const { specialistId, notes } = req.body;
        const consultation = await prisma_1.default.consultation.create({
            data: {
                requesterId: requesterId,
                specialistId,
                status: 'PENDING',
                notes,
            },
        });
        res.status(201).json({ success: true, data: consultation });
    }
    catch (error) {
        next(error);
    }
};
exports.createConsultation = createConsultation;
const getMyConsultations = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;
        const consultations = await prisma_1.default.consultation.findMany({
            where: role === 'DOCTOR'
                ? { specialistId: userId }
                : { requesterId: userId },
            orderBy: { startedAt: 'desc' }
        });
        res.json({ success: true, data: consultations });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyConsultations = getMyConsultations;
const updateConsultationStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const consultation = await prisma_1.default.consultation.update({
            where: { id },
            data: {
                status,
                notes,
                endedAt: status === 'COMPLETED' ? new Date() : undefined
            },
        });
        res.json({ success: true, data: consultation });
    }
    catch (error) {
        next(error);
    }
};
exports.updateConsultationStatus = updateConsultationStatus;
