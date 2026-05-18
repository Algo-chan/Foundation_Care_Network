const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function createAdmin() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const phone = '+251000000000';
  const password = 'adminpassword';
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const admin = await prisma.user.upsert({
      where: { phone },
      update: {
          isVerified: true,
          isApproved: true,
          role: 'ADMIN'
      },
      create: {
        name: 'System Admin',
        phone,
        passwordHash,
        role: 'ADMIN',
        isVerified: true,
        isApproved: true,
      },
    });

    console.log('--- ADMIN CREATED ---');
    console.log(`Phone: ${phone}`);
    console.log(`Password: ${password}`);
    console.log('---------------------');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
