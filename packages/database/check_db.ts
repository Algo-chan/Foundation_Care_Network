import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '../../.env') });

async function check() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      isVerified: true,
      isApproved: true
    }
  });
  console.log('--- USER STATUS ---');
  console.table(users);
  
  const hospitals = await prisma.hospital.count();
  console.log(`Hospitals in DB: ${hospitals}`);
  
  await prisma.$disconnect();
}

check().catch(console.error);
