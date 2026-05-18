import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { auditLogger } from '../middleware/auditLogger';

const router = Router();

router.use(authenticate);

router.get('/me', userController.getProfile);
router.patch('/me', auditLogger('Update Profile', 'User'), userController.updateProfile);

export default router;
