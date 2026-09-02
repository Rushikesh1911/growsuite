"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const workspaceAuth_1 = require("../middleware/workspaceAuth");
const ActivityController_1 = require("../controllers/ActivityController");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.use(workspaceAuth_1.requireWorkspaceAccess);
router.get('/', ActivityController_1.ActivityController.getFeed);
exports.default = router;
//# sourceMappingURL=activity.js.map