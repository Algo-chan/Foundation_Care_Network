"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const code = err.code || 'INTERNAL_ERROR';
    console.error(`[Error] ${code}: ${message}`, err);
    res.status(statusCode).json({
        success: false,
        error: {
            code,
            message,
            status: statusCode
        }
    });
};
exports.globalErrorHandler = globalErrorHandler;
