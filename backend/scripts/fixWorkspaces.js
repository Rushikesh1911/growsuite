"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../generated/prisma");
const prisma = new prisma_1.PrismaClient();
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
//# sourceMappingURL=fixWorkspaces.js.map