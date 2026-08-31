import { PrismaClient } from './generated/prisma';
import { GoogleCalendarService } from './src/services/GoogleCalendarService';

const prisma = new PrismaClient();

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
     await GoogleCalendarService.syncTaskToCalendar(user.id, task);
     console.log("Done");
  } catch (e) {
     console.error("Caught error:", e);
  }
}

main().catch(console.error);
