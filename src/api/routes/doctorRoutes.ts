import { Router } from 'express';
import { toggleAvailability, getAvailableDoctors, getDoctorById, updateLocation } from '../controllers/doctorController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/available', getAvailableDoctors);
router.get('/available/:id', getDoctorById);

router.patch('/availability', authenticate, authorize('DOCTOR'), toggleAvailability);
router.patch('/location', authenticate, authorize('DOCTOR'), updateLocation);

export default router;
