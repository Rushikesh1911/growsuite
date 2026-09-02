"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const workspaceAuth_1 = require("../middleware/workspaceAuth");
const PaymentController_1 = require("../controllers/PaymentController");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.use(workspaceAuth_1.requireWorkspaceAccess);
router.get('/', PaymentController_1.PaymentController.getPayments);
router.post('/', PaymentController_1.PaymentController.createPayment);
exports.default = router;
//# sourceMappingURL=payments.js.map