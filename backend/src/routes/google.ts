import { Router, Response } from 'express';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { google } from 'googleapis';
import { PrismaClient } from '../../generated/prisma';

const router = Router();
const prisma = new PrismaClient();

const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID || 'mock_client_id',
    process.env.GOOGLE_CLIENT_SECRET || 'mock_client_secret',
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/google/callback'
  );
};

// Initiate Google OAuth login
router.get('/login', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const oauth2Client = getOAuth2Client();
    
    const scopes = [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // Force consent screen to always get a refresh token
      state: req.user!.userId.toString() // Pass userId in state to associate after callback
    });

    res.json({ url });
  } catch (error) {
    console.error('Error initiating Google OAuth:', error);
    res.status(500).json({ error: 'Failed to initiate Google OAuth' });
  }
});

// Handle Google OAuth callback
router.get('/callback', async (req: AuthRequest, res: Response) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      console.error('Google OAuth Error:', error);
      res.redirect('http://localhost:3000/dashboard/settings?error=google_auth_failed');
      return;
    }

    if (!code || typeof code !== 'string') {
      res.redirect('http://localhost:3000/dashboard/settings?error=missing_code');
      return;
    }

    const userId = parseInt(state as string, 10);
    if (isNaN(userId)) {
      res.redirect('http://localhost:3000/dashboard/settings?error=invalid_state');
      return;
    }

    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    await prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token || undefined, // Keep existing if not provided
        googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      }
    });

    res.redirect('http://localhost:3000/dashboard/settings?success=google_connected');
  } catch (error) {
    console.error('Error handling Google OAuth callback:', error);
    res.redirect('http://localhost:3000/dashboard/settings?error=server_error');
  }
});

// Disconnect Google Calendar
router.post('/disconnect', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null,
      }
    });

    res.json({ success: true, message: 'Google account disconnected' });
  } catch (error) {
    console.error('Error disconnecting Google account:', error);
    res.status(500).json({ error: 'Failed to disconnect account' });
  }
});

export default router;
