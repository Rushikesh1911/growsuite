"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarService = void 0;
const googleapis_1 = require("googleapis");
const prisma_1 = require("../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
class GoogleCalendarService {
    static getOAuth2Client(user) {
        const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID || 'mock_client_id', process.env.GOOGLE_CLIENT_SECRET || 'mock_client_secret', process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/google/callback');
        oauth2Client.setCredentials({
            access_token: user.googleAccessToken,
            refresh_token: user.googleRefreshToken,
            expiry_date: user.googleTokenExpiry ? user.googleTokenExpiry.getTime() : undefined
        });
        // Automatically save new tokens if they get refreshed
        oauth2Client.on('tokens', async (tokens) => {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    googleAccessToken: tokens.access_token || user.googleAccessToken,
                    googleRefreshToken: tokens.refresh_token || user.googleRefreshToken,
                    googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : user.googleTokenExpiry,
                }
            });
        });
        return oauth2Client;
    }
    static async syncTaskToCalendar(userId, task) {
        try {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user || !user.googleAccessToken) {
                return; // User has not connected Google Calendar
            }
            // We only sync tasks that have a due date
            if (!task.dueDate)
                return;
            const auth = this.getOAuth2Client(user);
            const calendar = googleapis_1.google.calendar({ version: 'v3', auth });
            const event = {
                summary: `Task: ${task.title}`,
                description: task.description || 'Synced from GrowSuite CRM',
                start: {
                    dateTime: new Date(task.dueDate).toISOString(),
                },
                end: {
                    // Default to 1 hour after start
                    dateTime: new Date(new Date(task.dueDate).getTime() + 60 * 60 * 1000).toISOString(),
                },
            };
            if (task.googleEventId) {
                // Update existing event
                await calendar.events.update({
                    calendarId: 'primary',
                    eventId: task.googleEventId,
                    requestBody: event,
                });
            }
            else {
                // Create new event
                const res = await calendar.events.insert({
                    calendarId: 'primary',
                    requestBody: event,
                });
                if (res.data.id) {
                    // Save the event ID to the task
                    await prisma.task.update({
                        where: { id: task.id },
                        data: { googleEventId: res.data.id }
                    });
                }
            }
        }
        catch (error) {
            console.error('Error syncing task to Google Calendar:', error);
        }
    }
    static async deleteTaskFromCalendar(userId, googleEventId) {
        try {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user || !user.googleAccessToken)
                return;
            const auth = this.getOAuth2Client(user);
            const calendar = googleapis_1.google.calendar({ version: 'v3', auth });
            await calendar.events.delete({
                calendarId: 'primary',
                eventId: googleEventId
            });
        }
        catch (error) {
            console.error('Error deleting task from Google Calendar:', error);
        }
    }
}
exports.GoogleCalendarService = GoogleCalendarService;
//# sourceMappingURL=GoogleCalendarService.js.map