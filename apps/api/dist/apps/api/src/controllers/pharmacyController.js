"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPharmacyById = exports.getPharmacies = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getPharmacies = async (req, res, next) => {
    try {
        const pharmacies = await prisma_1.default.pharmacy.findMany({
            orderBy: { name: 'asc' }
        });
        res.json({ success: true, data: pharmacies });
    }
    catch (error) {
        next(error);
    }
};
exports.getPharmacies = getPharmacies;
const getPharmacyById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const pharmacy = await prisma_1.default.pharmacy.findUnique({
            where: { id },
            include: { prescriptions: true }
        });
        if (!pharmacy) {
            return res.status(404).json({ success: false, message: 'Pharmacy not found' });
        }
        res.json({ success: true, data: pharmacy });
    }
    catch (error) {
        next(error);
    }
};
exports.getPharmacyById = getPharmacyById;
