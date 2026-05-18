import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

export const createLabOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const doctorUserId = req.user?.userId;
    const { patientId, testName } = req.body;

    const doctor = await prisma.doctor.findUnique({ where: { userId: doctorUserId } });
    if (!doctor) {
        return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const labOrder = await prisma.labResult.create({
      data: {
        doctorId: doctor.id,
        patientId,
        testName,
        status: 'PENDING',
      },
    });

    res.status(201).json({ success: true, data: labOrder });
  } catch (error) {
    next(error);
  }
};

export const updateLabResult = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { resultValue, unit, labName } = req.body;

    const labResult = await prisma.labResult.update({
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
  } catch (error) {
    next(error);
  }
};

export const getMyLabResults = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    let labResults;

    if (role === 'PATIENT') {
        const patient = await prisma.patient.findUnique({ where: { userId } });
        labResults = await prisma.labResult.findMany({
            where: { patientId: patient?.id },
            include: { doctor: { include: { user: { select: { name: true } } } } },
            orderBy: { orderedAt: 'desc' }
        });
    } else if (role === 'DOCTOR') {
        const doctor = await prisma.doctor.findUnique({ where: { userId } });
        labResults = await prisma.labResult.findMany({
            where: { doctorId: doctor?.id },
            include: { patient: { include: { user: { select: { name: true } } } } },
            orderBy: { orderedAt: 'desc' }
        });
    }

    res.json({ success: true, data: labResults });
  } catch (error) {
    next(error);
  }
};
