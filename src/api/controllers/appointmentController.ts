import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { calculateWaitTime, formatWaitTime } from '../services/doctorService';
import { emitWaitTimeUpdate } from '../services/socketService';

async function triggerWaitTimeUpdate(doctorId: string) {
  const waitMinutes = await calculateWaitTime(doctorId);
  const waitTime = formatWaitTime(waitMinutes);
  emitWaitTimeUpdate(doctorId, waitTime, waitMinutes);
}

export const createAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { doctorId, scheduledAt, type } = req.body;

    const patient = await prisma.patient.findUnique({ where: { userId } });
    if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId,
        scheduledAt: new Date(scheduledAt),
        type,
        status: 'PENDING',
      },
    });

    await triggerWaitTimeUpdate(doctorId);

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

export const getMyAppointments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (role === 'PATIENT') {
        const patient = await prisma.patient.findUnique({ where: { userId } });
        const appointments = await prisma.appointment.findMany({
            where: { patientId: patient?.id },
            include: { doctor: { include: { user: { select: { name: true } } } } },
            orderBy: { scheduledAt: 'asc' }
        });
        return res.json({ success: true, data: appointments });
    } else if (role === 'DOCTOR') {
        const doctor = await prisma.doctor.findUnique({ where: { userId } });
        const appointments = await prisma.appointment.findMany({
            where: { doctorId: doctor?.id },
            include: { patient: { include: { user: { select: { name: true } } } } },
            orderBy: { scheduledAt: 'asc' }
        });
        return res.json({ success: true, data: appointments });
    }

    res.json({ success: true, data: [] });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
    });

    await triggerWaitTimeUpdate(appointment.doctorId);

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};
