import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create a default hospital for Dire Dawa
  const hospital = await prisma.hospital.upsert({
    where: { id: 'dire-dawa-main-hospital' },
    update: {},
    create: {
      id: 'dire-dawa-main-hospital',
      name: 'Dire Dawa General Hospital',
      location: 'Dire Dawa, Ethiopia',
      specialties: ['General', 'Cardiology', 'Pediatrics'],
    },
  });

  console.log('Seeded default hospital:', hospital.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
