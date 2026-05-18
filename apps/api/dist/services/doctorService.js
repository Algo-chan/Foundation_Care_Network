"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateWaitTime = calculateWaitTime;
exports.getNextAvailableSlot = getNextAvailableSlot;
exports.formatWaitTime = formatWaitTime;
const prisma_1 = __importDefault(require("../utils/prisma"));
const AVG_CONSULTATION_MINUTES = 20;
async function calculateWaitTime(doctorId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const confirmedCount = await prisma_1.default.appointment.count({
        where: {
            doctorId,
            scheduledAt: { gte: today, lt: tomorrow },
            status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
        },
    });
    return confirmedCount * AVG_CONSULTATION_MINUTES;
}
async function getNextAvailableSlot(doctorId) {
    const doctor = await prisma_1.default.doctor.findUnique({
        where: { id: doctorId },
        select: { workingHours: true },
    });
    if (!doctor?.workingHours)
        return null;
    const wh = doctor.workingHours;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const workStart = new Date(`${todayStr}T${wh.start}:00`);
    const workEnd = new Date(`${todayStr}T${wh.end}:00`);
    if (now >= workEnd)
        return null;
    let slotStart = now > workStart ? now : workStart;
    slotStart.setMinutes(Math.ceil(slotStart.getMinutes() / 30) * 30, 0, 0);
    const existingAppts = await prisma_1.default.appointment.findMany({
        where: {
            doctorId,
            scheduledAt: { gte: slotStart, lt: workEnd },
            status: { not: 'CANCELLED' },
        },
        select: { scheduledAt: true },
        orderBy: { scheduledAt: 'asc' },
    });
    const bookedTimes = new Set(existingAppts.map((a) => a.scheduledAt.getTime()));
    const slotDurationMs = (wh.slotDuration || 30) * 60 * 1000;
    let candidate = new Date(slotStart.getTime());
    while (candidate < workEnd) {
        const isBooked = Array.from(bookedTimes).some((bt) => Math.abs(bt - candidate.getTime()) < slotDurationMs);
        if (!isBooked) {
            return candidate.toISOString();
        }
        candidate = new Date(candidate.getTime() + slotDurationMs);
    }
    return null;
}
function formatWaitTime(minutes) {
    if (minutes < 1)
        return 'No wait';
    if (minutes < 60)
        return `${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}
