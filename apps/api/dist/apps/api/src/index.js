"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: '../../.env' });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const socketService_1 = require("./services/socketService");
const PORT = process.env.PORT || 4000;
console.log('--- STARTING API ---');
console.log('ENV PATH:', path_1.default.join(__dirname, '../../../.env'));
console.log('PORT:', process.env.PORT);
console.log('DB_URL:', process.env.DATABASE_URL ? 'DEFINED' : 'UNDEFINED');
const server = http_1.default.createServer(app_1.default);
(0, socketService_1.initSocketIO)(server);
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
