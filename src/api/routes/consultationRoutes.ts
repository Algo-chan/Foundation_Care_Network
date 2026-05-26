import { Router } from 'express';
import { createConsultation, getMyConsultations, updateConsultationStatus, getChatHistory, assignSpecialist } from '../controllers/consultationController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', authorize('RURAL_HO'), createConsultation);
router.get('/my', getMyConsultations);
router.get('/:id/messages', getChatHistory);
router.patch('/:id', authorize('DOCTOR'), updateConsultationStatus);
router.post('/:id/assign', authorize('DOCTOR'), assignSpecialist);

export default router;
