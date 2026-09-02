"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("./generated/prisma");
const GoogleCalendarService_1 = require("./src/services/GoogleCalendarService");
const prisma = new prisma_1.PrismaClient();
async function main() {
    const user = await prisma.user.findFirst({ where: { googleAccessToken: { not: null } } });
    if (!user) {
        console.log("No user with google calendar connected");
        return;
    }
    const task = await prisma.task.findFirst({ where: { dueDate: { not: null } } });
    if (!task) {
        console.log("No tasks with due date");
        return;
    }
    console.log("Trying to sync task", task.id, "to user", user.id);
    try {
        await GoogleCalendarService_1.GoogleCalendarService.syncTaskToCalendar(user.id, task);
        console.log("Done");
    }
    catch (e) {
        console.error("Caught error:", e);
    }
}
main().catch(console.error);
//# sourceMappingURL=test-gcal.js.map