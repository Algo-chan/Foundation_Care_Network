import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

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

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

export const getMyAppointments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    let appointments;

    if (role === 'PATIENT') {
        const patient = await prisma.patient.findUnique({ where: { userId } });
        appointments = await prisma.appointment.findMany({
            where: { patientId: patient?.id },
            include: { doctor: { include: { user: { select: { name: true } } } } },
            orderBy: { scheduledAt: 'asc' }
        });
    } else if (role === 'DOCTOR') {
        const doctor = await prisma.doctor.findUnique({ where: { userId } });
        appointments = await prisma.appointment.findMany({
            where: { doctorId: doctor?.id },
            include: { patient: { include: { user: { select: { name: true } } } } },
            orderBy: { scheduledAt: 'asc' }
        });
    }

    res.json({ success: true, data: appointments });
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

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};
