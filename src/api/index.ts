import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: '../../.env' });

import http from 'http';
import app from './app';
import { initSocketIO } from './services/socketService';

const PORT = process.env.PORT || 4000;

console.log('--- STARTING API ---');
console.log('ENV PATH:', path.join(__dirname, '../../../.env'));
console.log('PORT:', process.env.PORT);
console.log('DB_URL:', process.env.DATABASE_URL ? 'DEFINED' : 'UNDEFINED');

const server = http.createServer(app);
initSocketIO(server);

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
