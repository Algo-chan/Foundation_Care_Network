import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '../../.env') });

async function createAdmin() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const email = 'admin@fcn.com';
  const password = 'adminpassword';
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
        isVerified: true,
        isApproved: true,
        role: 'ADMIN'
    },
    create: {
      name: 'System Admin',
      email,
      passwordHash,
      role: 'ADMIN',
      isVerified: true,
      isApproved: true,
    },
  });

  console.log('--- ADMIN CREATED ---');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log('---------------------');
  
  await prisma.$disconnect();
}

createAdmin().catch(console.error);
