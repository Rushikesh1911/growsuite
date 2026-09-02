"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const BillingController_1 = require("../controllers/BillingController");
const workspaceAuth_1 = require("../middleware/workspaceAuth");
const router = (0, express_1.Router)();
// Protected routes (requireAuth + requireWorkspaceAccess)
router.get('/', auth_1.requireAuth, workspaceAuth_1.requireWorkspaceAccess, BillingController_1.BillingController.getBillingState);
router.post('/checkout', auth_1.requireAuth, workspaceAuth_1.requireWorkspaceAccess, BillingController_1.BillingController.createCheckout);
exports.default = router;
//# sourceMappingURL=billing.js.map