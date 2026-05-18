import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import prisma from '../utils/prisma';

export const auditLogger = (action: string, entity: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function (body) {
      const statusCode = res.statusCode;
      
      // Only log successful modifications (POST, PATCH, DELETE) or as specified
      if (statusCode >= 200 && statusCode < 300 && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
        const userId = req.user?.userId;
        if (userId) {
            // We use a background task to not block the response
            prisma.auditLog.create({
                data: {
                    userId,
                    action: `${req.method} ${action}`,
                    entity,
                    entityId: (JSON.parse(body).data?.id || req.params.id || 'N/A').toString(),
                    ipAddress: req.ip || req.socket.remoteAddress,
                }
            }).catch((err: any) => console.error('Audit Log Error:', err));
        }
      }
      
      return originalSend.call(this, body);
    };

    next();
  };
};
