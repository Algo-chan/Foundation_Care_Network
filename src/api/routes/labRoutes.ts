import { Router } from 'express';
import { createLabOrder, updateLabResult, getMyLabResults } from '../controllers/labController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/order', authorize('DOCTOR'), createLabOrder);
router.patch('/:id/result', authorize('ADMIN'), updateLabResult); // Only admins/lab techs can update results
router.get('/my', getMyLabResults);

export default router;
