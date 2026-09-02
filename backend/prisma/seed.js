"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
    // Create admin user
    const adminPassword = await bcrypt_1.default.hash('password123', 10);
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
                    role: client_1.WorkspaceRole.OWNER,
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
//# sourceMappingURL=seed.js.map