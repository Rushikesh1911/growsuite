const { PrismaClient } = require('./backend/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: 3, workspaceId: 2 },
      orderBy: { createdAt: 'desc' },
    });
    console.log("Tasks:", tasks);
  } catch (err) {
    console.error("Failed findMany:", err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
