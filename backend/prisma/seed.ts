import { PrismaClient, WorkspaceRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@growsuite.com' },
    update: {},
    create: {
      email: 'admin@growsuite.com',
      password: adminPassword,
      name: 'System Admin',
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  // Create workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'GrowSuite HQ',
      members: {
        create: {
          userId: admin.id,
          role: WorkspaceRole.OWNER,
        },
      },
    },
  });
  console.log(`Created workspace: ${workspace.name} and assigned Admin as OWNER`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
