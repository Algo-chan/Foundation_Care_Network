import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { calculateWaitTime, getNextAvailableSlot, formatWaitTime } from '../services/doctorService';
import { emitDoctorAvailabilityChange } from '../services/socketService';

export const toggleAvailability = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    const doctor = await prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: { code: 'DOCTOR_NOT_FOUND', message: 'Doctor profile not found', status: 404 }
      });
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { userId },
      data: { isAvailable: !doctor.isAvailable },
    });

    emitDoctorAvailabilityChange(doctor.id, updatedDoctor.isAvailable);

    res.json({
      success: true,
      message: `Availability turned ${updatedDoctor.isAvailable ? 'ON' : 'OFF'}`,
      data: { isAvailable: updatedDoctor.isAvailable }
    });
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
        return res.status(400).json({
            success: false,
            error: { code: 'INVALID_INPUT', message: 'Latitude and Longitude are required', status: 400 }
        });
    }

    await prisma.doctor.update({
      where: { userId },
      data: { 
          lastLat: parseFloat(lat), 
          lastLng: parseFloat(lng) 
      },
    });

    res.json({
      success: true,
      message: 'Location updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableDoctors = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { specialty, hospitalId } = req.query;

    const doctors = await prisma.doctor.findMany({
      where: {
        isAvailable: true,
        user: { isApproved: true },
        specialty: specialty ? String(specialty) : undefined,
        hospitalId: hospitalId ? String(hospitalId) : undefined,
      },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
          }
        },
        hospital: true,
      }
    });

    const doctorsWithMeta = await Promise.all(
      doctors.map(async (doc: any) => {
        const waitMinutes = await calculateWaitTime(doc.id);
        const nextSlot = await getNextAvailableSlot(doc.id);
        return {
          ...doc,
          waitTime: formatWaitTime(waitMinutes),
          waitMinutes,
          nextAvailableSlot: nextSlot,
        };
      })
    );

    res.json({ success: true, data: doctorsWithMeta });
  } catch (error) {
    next(error);
  }
};

export const getDoctorById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, phone: true, email: true } },
        hospital: true,
      },
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: { code: 'DOCTOR_NOT_FOUND', message: 'Doctor not found', status: 404 }
      });
    }

    const waitMinutes = await calculateWaitTime(doctor.id);
    const nextSlot = await getNextAvailableSlot(doctor.id);

    res.json({
      success: true,
      data: {
        ...doctor,
        waitTime: formatWaitTime(waitMinutes),
        waitMinutes,
        nextAvailableSlot: nextSlot,
      }
    });
  } catch (error) {
    next(error);
  }
};
