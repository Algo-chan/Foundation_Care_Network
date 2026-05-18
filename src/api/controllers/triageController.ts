import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { analyzeTriage } from '../services/triageService';

export const submitTriage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const triageData = req.body;
    
    // In a real app, we might want to save this to the database first
    // especially if it's coming from a nurse/vitals recording.
    
    const result = await analyzeTriage(triageData);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};
