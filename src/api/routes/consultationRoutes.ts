import { Router } from 'express';
import { createConsultation, getMyConsultations, updateConsultationStatus } from '../controllers/consultationController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', authorize('RURAL_HO'), createConsultation);
router.get('/my', getMyConsultations);
router.patch('/:id', authorize('DOCTOR'), updateConsultationStatus);

export default router;
