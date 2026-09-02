"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../generated/prisma");
const auth_1 = require("../middleware/auth");
const GoogleAuthService_1 = require("../services/GoogleAuthService");
const EmailService_1 = require("../services/EmailService");
const crypto_1 = __importDefault(require("crypto"));
const prisma = new prisma_1.PrismaClient();
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
// Get current user profile and workspaces
router.get('/me', auth_1.requireAuth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                name: true,
                jobTitle: true,
                emailSignature: true,
                avatarUrl: true,
                themePreference: true,
                timezone: true,
                dateFormat: true,
                notificationPreferences: true,
                phone: true,
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
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});
// Update current user profile
router.patch('/me', auth_1.requireAuth, async (req, res) => {
    const { name, jobTitle, emailSignature, themePreference, timezone, dateFormat, notificationPreferences, phone, hourlyRate } = req.body;
    try {
        const user = await prisma.user.update({
            where: { id: req.user.userId },
            data: { name, jobTitle, emailSignature, themePreference, timezone, dateFormat, notificationPreferences, phone, hourlyRate },
            select: {
                id: true,
                email: true,
                name: true,
                jobTitle: true,
                emailSignature: true,
                avatarUrl: true,
                themePreference: true,
                timezone: true,
                dateFormat: true,
                notificationPreferences: true,
                phone: true,
                hourlyRate: true
            }
        });
        res.json(user);
    }
    catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});
// User signup
router.post('/signup', async (req, res) => {
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
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
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
        await EmailService_1.EmailService.sendVerificationEmail(email, verificationToken);
        res.status(201).json({ requireVerification: true, message: "Verification email sent." });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create account' });
    }
});
// User login
router.post('/login', async (req, res) => {
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
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: '7d',
        });
        res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name } });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'An error occurred during login' });
    }
});
// Google login
router.post('/google', async (req, res) => {
    const { credential } = req.body;
    if (!credential) {
        res.status(400).json({ error: 'Google credential is required' });
        return;
    }
    try {
        const payload = await GoogleAuthService_1.GoogleAuthService.verifyIdToken(credential);
        // Find the user by email or create a new one
        let user = await prisma.user.findUnique({
            where: { email: payload.email },
        });
        if (!user) {
            // Create the user and a default workspace
            const dummyPassword = await bcrypt_1.default.hash(Math.random().toString(36).slice(-10) + 'A1!', 10);
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
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: '7d',
        });
        res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name } });
    }
    catch (error) {
        console.error('Google login error:', error);
        res.status(401).json({ error: 'Failed to verify Google token' });
    }
});
// Verify email token
router.get('/verify', async (req, res) => {
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
    }
    catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ error: 'Failed to verify email' });
    }
});
// Change password
router.patch('/password', auth_1.requireAuth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'Current and new password are required' });
        return;
    }
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId }
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const isPasswordValid = await bcrypt_1.default.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Incorrect current password' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});
// Forgot password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
    }
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // To prevent email enumeration, return success even if user not found
            res.json({ message: 'If an account with that email exists, we sent a password reset link.' });
            return;
        }
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 3600000); // 1 hour
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpires: resetExpires,
            }
        });
        await EmailService_1.EmailService.sendPasswordResetEmail(email, resetToken);
        res.json({ message: 'If an account with that email exists, we sent a password reset link.' });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});
// Reset password
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) {
        res.status(400).json({ error: 'Token and new password are required' });
        return;
    }
    try {
        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { gt: new Date() }
            }
        });
        if (!user) {
            res.status(400).json({ error: 'Invalid or expired reset token.' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            }
        });
        res.json({ message: 'Password has been reset successfully.' });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map