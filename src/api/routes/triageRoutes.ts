import { Router } from 'express';
import { submitTriage } from '../controllers/triageController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Secure triage submission
router.post('/analyze', authenticate, submitTriage);

export default router;
