"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const workspaceAuth_1 = require("../middleware/workspaceAuth");
const WorkspaceController_1 = require("../controllers/WorkspaceController");
const router = (0, express_1.Router)();
// Public routes
router.get('/invitations/:token', WorkspaceController_1.WorkspaceController.getInvitation);
// Require auth for these
router.post('/', auth_1.requireAuth, WorkspaceController_1.WorkspaceController.createWorkspace);
router.post('/invitations/:token/accept', auth_1.requireAuth, WorkspaceController_1.WorkspaceController.acceptInvitation);
router.post('/invitations/:token/decline', auth_1.requireAuth, WorkspaceController_1.WorkspaceController.declineInvitation);
// Require workspace access for these routes
router.get('/current', auth_1.requireAuth, workspaceAuth_1.requireWorkspaceAccess, WorkspaceController_1.WorkspaceController.getCurrentWorkspace);
router.post('/invite', auth_1.requireAuth, workspaceAuth_1.requireWorkspaceAccess, WorkspaceController_1.WorkspaceController.inviteMember);
router.put('/:id', auth_1.requireAuth, workspaceAuth_1.requireWorkspaceAccess, WorkspaceController_1.WorkspaceController.updateWorkspace);
router.delete('/:id', auth_1.requireAuth, workspaceAuth_1.requireWorkspaceAccess, WorkspaceController_1.WorkspaceController.deleteWorkspace);
exports.default = router;
//# sourceMappingURL=workspaces.js.map