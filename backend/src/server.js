"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const leads_1 = __importDefault(require("./routes/leads"));
const deals_1 = __importDefault(require("./routes/deals"));
const clients_1 = __importDefault(require("./routes/clients"));
const projects_1 = __importDefault(require("./routes/projects"));
const invoices_1 = __importDefault(require("./routes/invoices"));
const activity_1 = __importDefault(require("./routes/activity"));
const workspaces_1 = __importDefault(require("./routes/workspaces"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const calendar_1 = __importDefault(require("./routes/calendar"));
const payments_1 = __importDefault(require("./routes/payments"));
const razorpay_1 = __importDefault(require("./routes/razorpay"));
const uploads_1 = __importDefault(require("./routes/uploads"));
const search_1 = __importDefault(require("./routes/search"));
const google_1 = __importDefault(require("./routes/google"));
const onboarding_1 = __importDefault(require("./routes/onboarding"));
const timeEntry_routes_1 = __importDefault(require("./routes/timeEntry.routes"));
const customFields_1 = __importDefault(require("./routes/customFields"));
const webToLead_1 = __importDefault(require("./routes/webToLead"));
const automations_1 = __importDefault(require("./routes/automations"));
const path_1 = __importDefault(require("path"));
const prisma_1 = require("../generated/prisma");
const socket_1 = require("./socket");
const billing_1 = __importDefault(require("./routes/billing"));
const billingWebhook_1 = __importDefault(require("./routes/billingWebhook"));
const prisma = new prisma_1.PrismaClient();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
// Webhook must be parsed as raw body, so mount it before express.json()
app.use('/api/billing/webhook', billingWebhook_1.default);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/billing', billing_1.default);
// Serve static files from the uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
app.use('/api/auth', auth_1.default);
app.use('/api/leads', leads_1.default);
app.use('/api/deals', deals_1.default);
app.use('/api/clients', clients_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/tasks', tasks_1.default);
app.use('/api/invoices', invoices_1.default);
app.use('/api/payments', payments_1.default);
app.use('/api/activity', activity_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/calendar', calendar_1.default);
app.use('/api/workspaces', workspaces_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/razorpay', razorpay_1.default);
app.use('/api/uploads', uploads_1.default);
app.use('/api/search', search_1.default);
app.use('/api/google', google_1.default);
app.use('/api/onboarding', onboarding_1.default);
app.use('/api/workspaces/:workspaceId/time-entries', timeEntry_routes_1.default);
app.use('/api/custom-fields', customFields_1.default);
app.use('/api/web-to-lead', webToLead_1.default);
app.use('/api/automations', automations_1.default);
// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Check database connectivity
        await prisma.$queryRaw `SELECT 1`;
        res.json({
            status: 'OK',
            database: 'Connected',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Database connection error in health check:', error);
        res.status(500).json({
            status: 'ERROR',
            database: 'Disconnected',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
// Fetch all users
app.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
// Create a new user
app.post('/users', async (req, res) => {
    const { email, name } = req.body;
    if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
    }
    try {
        const user = await prisma.user.create({
            data: { email, name, password: "mockpassword123" }
        });
        res.status(201).json(user);
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user (might be duplicate email)' });
    }
});
// Start the server
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
// Initialize Socket.io
socket_1.SocketService.init(server);
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received. Closing HTTP server and Prisma client.');
    server.close(async () => {
        await prisma.$disconnect();
        console.log('HTTP server closed.');
        process.exit(0);
    });
});
//# sourceMappingURL=server.js.map