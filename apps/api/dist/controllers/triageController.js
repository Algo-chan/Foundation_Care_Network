"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitTriage = void 0;
const triageService_1 = require("../services/triageService");
const submitTriage = async (req, res, next) => {
    try {
        const triageData = req.body;
        // In a real app, we might want to save this to the database first
        // especially if it's coming from a nurse/vitals recording.
        const result = await (0, triageService_1.analyzeTriage)(triageData);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.submitTriage = submitTriage;
