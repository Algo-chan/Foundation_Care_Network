"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const triageController_1 = require("../controllers/triageController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Secure triage submission
router.post('/analyze', auth_1.authenticate, triageController_1.submitTriage);
exports.default = router;
