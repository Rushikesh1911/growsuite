import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function fixWorkspaces() {
  console.log('Checking for users without workspaces...');
  
  const users = await prisma.user.findMany({
    include: {
      workspaceMemberships: true
    }
  });

  for (const user of users) {
    if (user.workspaceMemberships.length === 0) {
      console.log(`User ${user.email} has no workspace. Creating one...`);
      await prisma.workspaceMember.create({
        data: {
          role: 'OWNER',
          user: {
            connect: { id: user.id }
          },
          workspace: {
            create: {
              name: `${user.name || 'My'} Workspace`
            }
          }
        }
      });
      console.log(`Created workspace for ${user.email}`);
    }
  }

  console.log('Done fixing workspaces.');
  await prisma.$disconnect();
}

fixWorkspaces().catch(console.error);
