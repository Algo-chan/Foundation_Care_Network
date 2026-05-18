import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

export const getPharmacies = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const pharmacies = await prisma.pharmacy.findMany({
        orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: pharmacies });
  } catch (error) {
    next(error);
  }
};

export const getPharmacyById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id },
      include: { prescriptions: true }
    });
    if (!pharmacy) {
        return res.status(404).json({ success: false, message: 'Pharmacy not found' });
    }
    res.json({ success: true, data: pharmacy });
  } catch (error) {
    next(error);
  }
};
