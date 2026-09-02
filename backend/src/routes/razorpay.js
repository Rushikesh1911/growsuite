"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RazorpayController_1 = require("../controllers/RazorpayController");
const router = (0, express_1.Router)();
// Note: These routes are public because the client (who doesn't have an account) needs to pay the invoice
router.post('/create-order/:invoiceId', RazorpayController_1.RazorpayController.createOrder);
router.post('/verify', RazorpayController_1.RazorpayController.verifyPayment);
exports.default = router;
//# sourceMappingURL=razorpay.js.map