"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const errorHandler_1 = require("./middleware/errorHandler");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const doctorRoutes_1 = __importDefault(require("./routes/doctorRoutes"));
const triageRoutes_1 = __importDefault(require("./routes/triageRoutes"));
const consultationRoutes_1 = __importDefault(require("./routes/consultationRoutes"));
const prescriptionRoutes_1 = __importDefault(require("./routes/prescriptionRoutes"));
const appointmentRoutes_1 = __importDefault(require("./routes/appointmentRoutes"));
const labRoutes_1 = __importDefault(require("./routes/labRoutes"));
const pharmacyRoutes_1 = __importDefault(require("./routes/pharmacyRoutes"));
const rateLimiter_1 = require("./middleware/rateLimiter");
const app = (0, express_1.default)();
// Security Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
// Rate Limiting
app.use(rateLimiter_1.generalRateLimiter);
// Request Parsing
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Logging
app.use((0, morgan_1.default)('dev'));
// Routes
app.use('/v1/auth', rateLimiter_1.authRateLimiter, authRoutes_1.default);
app.use('/v1/admin', adminRoutes_1.default);
app.use('/v1/users', userRoutes_1.default);
app.use('/v1/doctors', doctorRoutes_1.default);
app.use('/v1/triage', triageRoutes_1.default);
app.use('/v1/consultations', consultationRoutes_1.default);
app.use('/v1/prescriptions', prescriptionRoutes_1.default);
app.use('/v1/appointments', appointmentRoutes_1.default);
app.use('/v1/lab', labRoutes_1.default);
app.use('/v1/pharmacies', pharmacyRoutes_1.default);
app.get('/health', (req, res) => {
    res.json({ success: true, message: 'API is healthy' });
});
// Error Handling
app.use(errorHandler_1.globalErrorHandler);
exports.default = app;
