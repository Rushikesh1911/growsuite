"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const workspaceAuth_1 = require("../middleware/workspaceAuth");
const AutomationController_1 = require("../controllers/AutomationController");
const router = (0, express_1.Router)();
// Require auth and workspace access for all routes
router.use(auth_1.requireAuth);
router.use(workspaceAuth_1.requireWorkspaceAccess);
router.get('/', AutomationController_1.AutomationController.getAutomations);
router.get('/:id', AutomationController_1.AutomationController.getAutomation);
router.post('/', AutomationController_1.AutomationController.createAutomation);
router.put('/:id', AutomationController_1.AutomationController.updateAutomation);
router.delete('/:id', AutomationController_1.AutomationController.deleteAutomation);
exports.default = router;
//# sourceMappingURL=automations.js.map