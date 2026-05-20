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

    socket.on('join:consultation', (consultationId: string) => {
      socket.join(`consultation:${consultationId}`);
    });

    socket.on('send:message', async (data: { consultationId: string, senderId: string, content: string }) => {
      try {
        const message = await prisma.message.create({
          data: {
            consultationId: data.consultationId,
            senderId: data.senderId,
            content: data.content,
          },
          include: {
            sender: { select: { name: true, role: true } },
          },
        });

        io.to(`consultation:${data.consultationId}`).emit('new:message', message);
      } catch (error) {
        console.error('Failed to send message:', error);
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

export function emitWaitTimeUpdate(doctorId: string, waitTime: string, waitMinutes: number) {
  if (!io) return;
  io.to('public').emit('doctor:wait-time-updated', { doctorId, waitTime, waitMinutes });
}
