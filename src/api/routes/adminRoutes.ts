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
router.delete('/users/:id', auditLogger('Delete User', 'User'), adminController.deleteUser);

router.get('/hospitals', adminController.getHospitals);
router.post('/hospitals', auditLogger('Create Hospital', 'Hospital'), adminController.createHospital);
router.delete('/hospitals/:id', auditLogger('Delete Hospital', 'Hospital'), adminController.deleteHospital);

router.get('/pharmacies', adminController.getPharmacies);
router.post('/pharmacies', auditLogger('Create Pharmacy', 'Pharmacy'), adminController.createPharmacy);
router.delete('/pharmacies/:id', auditLogger('Delete Pharmacy', 'Pharmacy'), adminController.deletePharmacy);

router.get('/audit-logs', adminController.getAuditLogs);
router.get('/audit-logs/export', adminController.exportAuditLogs);

export default router;
