import { Router } from 'express';
import { getPharmacies, getPharmacyById } from '../controllers/pharmacyController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getPharmacies);
router.get('/:id', getPharmacyById);

export default router;
