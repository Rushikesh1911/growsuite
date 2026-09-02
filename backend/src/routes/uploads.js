"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const auth_1 = require("../middleware/auth");
const workspaceAuth_1 = require("../middleware/workspaceAuth");
const prisma_1 = require("../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
const router = (0, express_1.Router)();
// Configure multer storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Make sure this folder exists in backend/
    },
    filename: (req, file, cb) => {
        // Generate a unique filename: <random_hex>-<original_name>
        const randomHex = crypto_1.default.randomBytes(8).toString('hex');
        const ext = path_1.default.extname(file.originalname);
        const basename = path_1.default.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '');
        cb(null, `${randomHex}-${basename}${ext}`);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});
/**
 * @route POST /api/uploads/workspace-logo
 * @desc Upload a workspace logo and update the workspace record
 */
router.post('/workspace-logo', auth_1.requireAuth, workspaceAuth_1.requireWorkspaceAccess, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        const workspaceId = req.workspaceId;
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        // Update workspace logo
        await prisma.workspace.update({
            where: { id: workspaceId },
            data: { logoUrl: fileUrl }
        });
        res.status(200).json({ url: fileUrl });
    }
    catch (error) {
        console.error('Error uploading workspace logo:', error);
        res.status(500).json({ error: 'Failed to upload logo' });
    }
});
/**
 * @route POST /api/uploads/avatar
 * @desc Upload a user profile avatar and update the user record
 */
router.post('/avatar', auth_1.requireAuth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        const userId = req.user.userId;
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        // Update user avatar
        await prisma.user.update({
            where: { id: userId },
            data: { avatarUrl: fileUrl }
        });
        res.status(200).json({ url: fileUrl });
    }
    catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({ error: 'Failed to upload avatar' });
    }
});
/**
 * @route POST /api/uploads/attachment
 * @desc Upload a general attachment linked to a project or task
 */
router.post('/attachment', auth_1.requireAuth, workspaceAuth_1.requireWorkspaceAccess, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        const workspaceId = req.workspaceId;
        const userId = req.user.userId;
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
    }
    catch (error) {
        console.error('Error uploading attachment:', error);
        res.status(500).json({ error: 'Failed to upload attachment' });
    }
});
exports.default = router;
//# sourceMappingURL=uploads.js.map