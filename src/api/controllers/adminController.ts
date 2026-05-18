import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { registerUser } from './authController';

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role, isApproved, search } = req.query;

    const users = await prisma.user.findMany({
      where: {
        role: role ? (role as any) : undefined,
        isApproved: isApproved !== undefined ? isApproved === 'true' : undefined,
        OR: search ? [
          { name: { contains: search as string, mode: 'insensitive' } },
          { phone: { contains: search as string } },
          { email: { contains: search as string, mode: 'insensitive' } },
        ] : undefined
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        isVerified: true,
        isApproved: true,
        createdAt: true
      }
    });

    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await registerUser(req.body);
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            error: { code: 'CREATE_FAILED', message: error.message, status: 400 }
        });
    }
};
export const approveUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const user = await prisma.user.update({
      where: { id },
      data: { isApproved: true },
    });

    res.json({ 
        success: true, 
        message: `User ${user.name} approved successfully`,
        data: { id: user.id, isApproved: user.isApproved }
    });
  } catch (error) {
    next(error);
  }
};
export const getStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      doctorsCount,
      nursesCount,
      patientsCount,
      pendingApprovals,
      hospitalsCount,
      pharmaciesCount,
      recentLogs,
      criticalVitals
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'DOCTOR' } }),
      prisma.user.count({ where: { role: 'NURSE' } }),
      prisma.user.count({ where: { role: 'PATIENT' } }),
      prisma.user.count({ where: { isApproved: false } }),
      prisma.hospital.count(),
      prisma.pharmacy.count(),
      prisma.auditLog.findMany({
        take: 5,
        orderBy: { timestamp: 'desc' },
        include: { user: { select: { name: true } } }
      }),
      prisma.vitals.count({
        where: {
          triageResult: {
            path: ['priority'],
            equals: 'CRITICAL'
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          doctors: doctorsCount,
          nurses: nursesCount,
          patients: patientsCount,
          pendingApprovals
        },
        entities: {
          hospitals: hospitalsCount,
          pharmacies: pharmaciesCount
        },
        metrics: {
          criticalFlags: criticalVitals,
          patientReach: patientsCount,
          satisfaction: 4.8,
          avgResponse: '12m'
        },
        recentLogs
      }
    });
  } catch (error) {
    next(error);
  }
};
