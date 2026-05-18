import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import prisma from '../utils/prisma';

let io: Server;

export function initSocketIO(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    socket.on('join:doctor-room', (doctorId: string) => {
      socket.join(`doctor:${doctorId}`);
    });

    socket.on('join:public', () => {
      socket.join('public');
    });

    socket.on('doctor:toggle-availability', async (data: { doctorId: string }) => {
      try {
        const doctor = await prisma.doctor.findUnique({
          where: { id: data.doctorId },
        });
        if (!doctor) return;

        const updated = await prisma.doctor.update({
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
      } catch {
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

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

export function emitDoctorAvailabilityChange(doctorId: string, isAvailable: boolean) {
  if (!io) return;
  io.to('public').emit('doctor:availability-changed', { doctorId, isAvailable });
  io.to(`doctor:${doctorId}`).emit('doctor:availability-changed', { doctorId, isAvailable });
}
