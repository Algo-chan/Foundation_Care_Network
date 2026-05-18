"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketIO = initSocketIO;
exports.getIO = getIO;
exports.emitDoctorAvailabilityChange = emitDoctorAvailabilityChange;
const socket_io_1 = require("socket.io");
const prisma_1 = __importDefault(require("../utils/prisma"));
let io;
function initSocketIO(server) {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });
    io.on('connection', (socket) => {
        socket.on('join:doctor-room', (doctorId) => {
            socket.join(`doctor:${doctorId}`);
        });
        socket.on('join:public', () => {
            socket.join('public');
        });
        socket.on('doctor:toggle-availability', async (data) => {
            try {
                const doctor = await prisma_1.default.doctor.findUnique({
                    where: { id: data.doctorId },
                });
                if (!doctor)
                    return;
                const updated = await prisma_1.default.doctor.update({
                    where: { id: data.doctorId },
                    data: { isAvailable: !doctor.isAvailable },
                });
                io.to('public').emit('doctor:availability-changed', {
                    doctorId: data.doctorId,
                    isAvailable: updated.isAvailable,
                });
                io.to(`doctor:${data.doctorId}`).emit('doctor:availability-changed', {
                    doctorId: data.doctorId,
                    isAvailable: updated.isAvailable,
                });
                socket.emit('doctor:toggle-result', {
                    success: true,
                    isAvailable: updated.isAvailable,
                });
            }
            catch {
                socket.emit('doctor:toggle-result', {
                    success: false,
                    message: 'Failed to toggle availability',
                });
            }
        });
        socket.on('disconnect', () => {
        });
    });
    return io;
}
function getIO() {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
}
function emitDoctorAvailabilityChange(doctorId, isAvailable) {
    if (!io)
        return;
    io.to('public').emit('doctor:availability-changed', { doctorId, isAvailable });
    io.to(`doctor:${doctorId}`).emit('doctor:availability-changed', { doctorId, isAvailable });
}
