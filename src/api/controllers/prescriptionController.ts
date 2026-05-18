import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

export const createPrescription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const doctorUserId = req.user?.userId;
    const { patientId, medications, notes, expiresAt, pharmacyId } = req.body;

    // Get doctor profile id
    const doctor = await prisma.doctor.findUnique({ where: { userId: doctorUserId } });
    if (!doctor) {
        return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const prescription = await prisma.prescription.create({
      data: {
        doctorId: doctor.id,
        patientId,
        medications,
        notes,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        pharmacyId,
      },
    });

    res.status(201).json({ success: true, data: prescription });
  } catch (error) {
    next(error);
  }
};

export const getMyPrescriptions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    let prescriptions;

    if (role === 'PATIENT') {
        const patient = await prisma.patient.findUnique({ where: { userId } });
        prescriptions = await prisma.prescription.findMany({
            where: { patientId: patient?.id },
            include: { doctor: { include: { user: { select: { name: true } } } } },
            orderBy: { issuedAt: 'desc' }
        });
    } else if (role === 'DOCTOR') {
        const doctor = await prisma.doctor.findUnique({ where: { userId } });
        prescriptions = await prisma.prescription.findMany({
            where: { doctorId: doctor?.id },
            include: { patient: { include: { user: { select: { name: true } } } } },
            orderBy: { issuedAt: 'desc' }
        });
    }

    res.json({ success: true, data: prescriptions });
  } catch (error) {
    next(error);
  }
};
