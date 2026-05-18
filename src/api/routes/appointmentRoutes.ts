import { Router } from 'express';
import { createAppointment, getMyAppointments, updateAppointmentStatus } from '../controllers/appointmentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', authorize('PATIENT'), createAppointment);
router.get('/my', getMyAppointments);
router.patch('/:id', authorize('DOCTOR'), updateAppointmentStatus);

export default router;
