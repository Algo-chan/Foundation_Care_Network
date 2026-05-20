import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  const http = await import('http');
  const app = (await import('./app')).default;
  const { initSocketIO } = await import('./services/socketService');

  const PORT = process.env.PORT || 4000;

  console.log('--- STARTING API ---');
  console.log('PORT:', process.env.PORT);
  console.log('DB_URL:', process.env.DATABASE_URL ? 'DEFINED' : 'UNDEFINED');

  const server = http.default.createServer(app);
  initSocketIO(server);

  server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

main();
