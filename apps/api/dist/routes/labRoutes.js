"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const labController_1 = require("../controllers/labController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/order', (0, auth_1.authorize)('DOCTOR'), labController_1.createLabOrder);
router.patch('/:id/result', (0, auth_1.authorize)('ADMIN'), labController_1.updateLabResult); // Only admins/lab techs can update results
router.get('/my', labController_1.getMyLabResults);
exports.default = router;
