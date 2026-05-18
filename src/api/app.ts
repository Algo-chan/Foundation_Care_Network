import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { globalErrorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import userRoutes from './routes/userRoutes';
import doctorRoutes from './routes/doctorRoutes';
import triageRoutes from './routes/triageRoutes';
import consultationRoutes from './routes/consultationRoutes';
import prescriptionRoutes from './routes/prescriptionRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import labRoutes from './routes/labRoutes';
import pharmacyRoutes from './routes/pharmacyRoutes';
import { generalRateLimiter, authRateLimiter } from './middleware/rateLimiter';

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate Limiting
app.use(generalRateLimiter);

// Request Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
app.use(morgan('dev'));

// Routes
app.use('/v1/auth', authRateLimiter, authRoutes);
app.use('/v1/admin', adminRoutes);
app.use('/v1/users', userRoutes);
app.use('/v1/doctors', doctorRoutes);
app.use('/v1/triage', triageRoutes);
app.use('/v1/consultations', consultationRoutes);
app.use('/v1/prescriptions', prescriptionRoutes);
app.use('/v1/appointments', appointmentRoutes);
app.use('/v1/lab', labRoutes);
app.use('/v1/pharmacies', pharmacyRoutes);

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy' });
});

// Error Handling
app.use(globalErrorHandler);

export default app;
