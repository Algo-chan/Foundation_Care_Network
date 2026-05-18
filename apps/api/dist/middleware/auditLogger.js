"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const auditLogger = (action, entity) => {
    return async (req, res, next) => {
        const originalSend = res.send;
        res.send = function (body) {
            const statusCode = res.statusCode;
            // Only log successful modifications (POST, PATCH, DELETE) or as specified
            if (statusCode >= 200 && statusCode < 300 && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
                const userId = req.user?.userId;
                if (userId) {
                    // We use a background task to not block the response
                    prisma_1.default.auditLog.create({
                        data: {
                            userId,
                            action: `${req.method} ${action}`,
                            entity,
                            entityId: (JSON.parse(body).data?.id || req.params.id || 'N/A').toString(),
                            ipAddress: req.ip || req.socket.remoteAddress,
                        }
                    }).catch((err) => console.error('Audit Log Error:', err));
                }
            }
            return originalSend.call(this, body);
        };
        next();
    };
};
exports.auditLogger = auditLogger;
