import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../../generated/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { GoogleAuthService } from '../services/GoogleAuthService';
import { EmailService } from '../services/EmailService';
import crypto from 'crypto';

const prisma = new PrismaClient();
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Get current user profile and workspaces
router.get('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        jobTitle: true,
        emailSignature: true,
        avatarUrl: true,
        googleAccessToken: true,
        hasCompletedOnboarding: true,
        hideOnboardingChecklist: true,
        workspaceMemberships: {
          include: {
            workspace: true,
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const { googleAccessToken, ...userData } = user;
    const hasGoogleCalendar = !!googleAccessToken;

    res.json({ ...userData, hasGoogleCalendar });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update current user profile
router.patch('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, jobTitle, emailSignature } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { name, jobTitle, emailSignature },
      select: {
        id: true,
        email: true,
        name: true,
        jobTitle: true,
        emailSignature: true,
        avatarUrl: true
      }
    });
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// User signup
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create the user and a default workspace
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        verificationToken,
        workspaceMemberships: {
          create: {
            role: 'OWNER',
            workspace: {
              create: {
                name: `${name || 'My'} Workspace`,
              }
            }
          }
        }
      },
    });

    // Send verification email
    await EmailService.sendVerificationEmail(email, verificationToken);

    res.status(201).json({ requireVerification: true, message: "Verification email sent." });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// User login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (!user.emailVerified) {
      res.status(403).json({ error: 'Please verify your email address before logging in.' });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

// Google login
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  const { credential } = req.body;

  if (!credential) {
    res.status(400).json({ error: 'Google credential is required' });
    return;
  }

  try {
    const payload = await GoogleAuthService.verifyIdToken(credential);

    // Find the user by email or create a new one
    let user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      // Create the user and a default workspace
      const dummyPassword = await bcrypt.hash(Math.random().toString(36).slice(-10) + 'A1!', 10);
      user = await prisma.user.create({
        data: {
          email: payload.email,
          password: dummyPassword,
          name: payload.name || null,
          emailVerified: new Date(),
          workspaceMemberships: {
            create: {
              role: 'OWNER',
              workspace: {
                create: {
                  name: `${payload.name || 'My'} Workspace`,
                }
              }
            }
          }
        },
      });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ error: 'Failed to verify Google token' });
  }
});

// Verify email token
router.get('/verify', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    res.status(400).json({ error: 'Invalid token' });
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token }
    });

    if (!user) {
      res.status(400).json({ error: 'Invalid or expired verification link.' });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null
      }
    });

    res.json({ message: 'Email verified successfully!' });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

export default router;
