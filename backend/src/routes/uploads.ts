import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth';
import { requireWorkspaceAccess } from '../middleware/workspaceAuth';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();
const router = Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this folder exists in backend/
  },
  filename: (req, file, cb) => {
    // Generate a unique filename: <random_hex>-<original_name>
    const randomHex = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '');
    cb(null, `${randomHex}-${basename}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

/**
 * @route POST /api/uploads/workspace-logo
 * @desc Upload a workspace logo and update the workspace record
 */
router.post(
  '/workspace-logo',
  requireAuth,
  requireWorkspaceAccess,
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const workspaceId = (req as any).workspaceId;
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

      // Update workspace logo
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: { logoUrl: fileUrl }
      });

      res.status(200).json({ url: fileUrl });
    } catch (error) {
      console.error('Error uploading workspace logo:', error);
      res.status(500).json({ error: 'Failed to upload logo' });
    }
  }
);

/**
 * @route POST /api/uploads/avatar
 * @desc Upload a user profile avatar and update the user record
 */
router.post(
  '/avatar',
  requireAuth,
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const userId = (req as any).user.userId;
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

      // Update user avatar
      await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: fileUrl }
      });

      res.status(200).json({ url: fileUrl });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      res.status(500).json({ error: 'Failed to upload avatar' });
    }
  }
);

/**
 * @route POST /api/uploads/attachment
 * @desc Upload a general attachment linked to a project or task
 */
router.post(
  '/attachment',
  requireAuth,
  requireWorkspaceAccess,
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const workspaceId = (req as any).workspaceId;
      const userId = (req as any).user.userId;
      const { projectId, taskId } = req.body;

      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

      // Create an Attachment record
      const attachment = await prisma.attachment.create({
        data: {
          fileName: req.file.originalname,
          fileUrl: fileUrl,
          fileType: req.file.mimetype,
          size: req.file.size,
          workspaceId: workspaceId,
          uploadedById: userId,
          projectId: projectId ? parseInt(projectId) : undefined,
          taskId: taskId ? parseInt(taskId) : undefined
        }
      });

      res.status(201).json(attachment);
    } catch (error) {
      console.error('Error uploading attachment:', error);
      res.status(500).json({ error: 'Failed to upload attachment' });
    }
  }
);

export default router;
