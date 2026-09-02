"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BillingController_1 = require("../controllers/BillingController");
const express_2 = __importDefault(require("express"));
const router = (0, express_1.Router)();
// Handle webhook (must receive raw buffer)
router.post('/', express_2.default.raw({ type: 'application/json' }), BillingController_1.BillingController.handleWebhook);
exports.default = router;
//# sourceMappingURL=billingWebhook.js.map