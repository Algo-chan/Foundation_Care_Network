import { Router } from 'express';
import { createPrescription, getMyPrescriptions } from '../controllers/prescriptionController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', authorize('DOCTOR'), createPrescription);
router.get('/my', getMyPrescriptions);

export default router;
