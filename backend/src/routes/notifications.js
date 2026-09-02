"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const workspaceAuth_1 = require("../middleware/workspaceAuth");
const NotificationController_1 = require("../controllers/NotificationController");
const router = (0, express_1.Router)();
// All notification routes require auth and a valid workspace context
router.use(auth_1.requireAuth);
router.use(workspaceAuth_1.requireWorkspaceAccess);
router.get('/', NotificationController_1.NotificationController.getNotifications);
router.patch('/read-all', NotificationController_1.NotificationController.markAllAsRead);
router.patch('/:id/read', NotificationController_1.NotificationController.markAsRead);
exports.default = router;
//# sourceMappingURL=notifications.js.map