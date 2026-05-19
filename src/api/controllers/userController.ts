import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import prisma from "../utils/prisma";
import {
  updateProfileSchema,
  updatePatientProfileSchema,
  updateDoctorProfileSchema,
  updateNurseProfileSchema,
} from "../../lib/user";

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        patient: true,
        doctor: { include: { hospital: true } },
        nurse: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
          status: 404,
        },
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    // 1. Update Base User Info
    const baseData = updateProfileSchema.parse(req.body);
    const cleanData: any = {};
    for (const [key, val] of Object.entries(baseData)) {
      if (val !== null) cleanData[key] = val;
    }
    await prisma.user.update({
      where: { id: userId },
      data: cleanData,
    });

    // 2. Update Role-Specific Info
    if (role === "PATIENT") {
      const patientData = updatePatientProfileSchema.parse(req.body);
      await prisma.patient.update({
        where: { userId },
        data: {
          ...patientData,
          dateOfBirth: patientData.dateOfBirth
            ? new Date(patientData.dateOfBirth)
            : undefined,
        },
      });
    } else if (role === "DOCTOR") {
      const doctorData = updateDoctorProfileSchema.parse(req.body);
      await prisma.doctor.update({
        where: { userId },
        data: doctorData,
      });
    } else if (role === "NURSE") {
      const nurseData = updateNurseProfileSchema.parse(req.body);
      await prisma.nurse.update({
        where: { userId },
        data: nurseData,
      });
    }

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    next(error);
  }
};
