import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';
import { auditLogger } from '../middleware/auditLogger';

const router = Router();

// All routes here require ADMIN role
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/users', adminController.getUsers);
router.get('/stats', adminController.getStats);
router.post('/users', auditLogger('Create User', 'User'), adminController.createUser);
router.patch('/users/:id/approve', auditLogger('Approve User', 'User'), adminController.approveUser);

export default router;
