import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireWorkspaceAccess } from '../middleware/workspaceAuth';
import { WorkspaceController } from '../controllers/WorkspaceController';

const router = Router();

// Public routes
router.get('/invitations/:token', WorkspaceController.getInvitation);

// Require auth for these
router.post('/', requireAuth, WorkspaceController.createWorkspace);
router.post('/invitations/:token/accept', requireAuth, WorkspaceController.acceptInvitation);
router.post('/invitations/:token/decline', requireAuth, WorkspaceController.declineInvitation);

// Require workspace access for these routes
router.get('/current', requireAuth, requireWorkspaceAccess, WorkspaceController.getCurrentWorkspace);
router.post('/invite', requireAuth, requireWorkspaceAccess, WorkspaceController.inviteMember);
router.put('/:id', requireAuth, requireWorkspaceAccess, WorkspaceController.updateWorkspace);
router.delete('/:id', requireAuth, requireWorkspaceAccess, WorkspaceController.deleteWorkspace);

export default router;
