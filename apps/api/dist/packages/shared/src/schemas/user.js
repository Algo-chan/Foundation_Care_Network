"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNurseProfileSchema = exports.updateDoctorProfileSchema = exports.updatePatientProfileSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    email: zod_1.z.string().email().optional().nullable(),
});
exports.updatePatientProfileSchema = zod_1.z.object({
    dateOfBirth: zod_1.z.string().optional(),
    bloodType: zod_1.z.string().optional().nullable(),
    chronicConditions: zod_1.z.string().optional().nullable(),
});
exports.updateDoctorProfileSchema = zod_1.z.object({
    specialty: zod_1.z.string().min(2).optional(),
    licenseNumber: zod_1.z.string().min(2).optional(),
    hospitalId: zod_1.z.string().optional(),
    workingHours: zod_1.z.any().optional(),
});
exports.updateNurseProfileSchema = zod_1.z.object({
    assignedZone: zod_1.z.string().optional().nullable(),
});
