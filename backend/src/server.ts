import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import leadRoutes from './routes/leads';
import dealRoutes from './routes/deals';
import clientRoutes from './routes/clients';
import projectRoutes from './routes/projects';
import invoiceRoutes from './routes/invoices';
import activityRoutes from './routes/activity';
import workspaceRoutes from './routes/workspaces';
import notificationsRoutes from './routes/notifications';
import taskRoutes from './routes/tasks';
import analyticsRoutes from './routes/analytics';
import calendarRoutes from './routes/calendar';
import paymentRoutes from './routes/payments';
import razorpayRoutes from './routes/razorpay';
import uploadsRoutes from './routes/uploads';
import searchRoutes from './routes/search';
import googleRoutes from './routes/google';
import onboardingRoutes from './routes/onboarding';
import path from 'path';
import { PrismaClient } from '../generated/prisma';
import { SocketService } from './socket';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/razorpay', razorpayRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/google', googleRoutes);
app.use('/api/onboarding', onboardingRoutes);

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error in health check:', error);
    res.status(500).json({
      status: 'ERROR',
      database: 'Disconnected',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Fetch all users
app.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create a new user
app.post('/users', async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user (might be duplicate email)' });
  }
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Initialize Socket.io
SocketService.init(server);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received. Closing HTTP server and Prisma client.');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
