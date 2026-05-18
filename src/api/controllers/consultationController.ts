import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

export const createConsultation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const requesterId = req.user?.userId;
    const { specialistId, notes } = req.body;

    const consultation = await prisma.consultation.create({
      data: {
        requesterId: requesterId!,
        specialistId,
        status: 'PENDING',
        notes,
      },
    });

    res.status(201).json({ success: true, data: consultation });
  } catch (error) {
    next(error);
  }
};

export const getMyConsultations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    const consultations = await prisma.consultation.findMany({
      where: role === 'DOCTOR' 
        ? { specialistId: userId } 
        : { requesterId: userId },
      orderBy: { startedAt: 'desc' }
    });

    res.json({ success: true, data: consultations });
  } catch (error) {
    next(error);
  }
};

export const updateConsultationStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status, notes } = req.body;

    const consultation = await prisma.consultation.update({
      where: { id },
      data: { 
        status, 
        notes,
        endedAt: status === 'COMPLETED' ? new Date() : undefined
      },
    });

    res.json({ success: true, data: consultation });
  } catch (error) {
    next(error);
  }
};
