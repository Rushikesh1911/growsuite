"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const workspaceAuth_1 = require("../middleware/workspaceAuth");
const InvoiceController_1 = require("../controllers/InvoiceController");
const router = (0, express_1.Router)();
router.get('/public/:id', InvoiceController_1.InvoiceController.getPublicInvoice);
router.get('/public/:id/pdf', InvoiceController_1.InvoiceController.generatePublicPdf);
router.use(auth_1.requireAuth);
router.use(workspaceAuth_1.requireWorkspaceAccess);
router.get('/', InvoiceController_1.InvoiceController.getInvoices);
router.post('/', InvoiceController_1.InvoiceController.createInvoice);
router.get('/:id', InvoiceController_1.InvoiceController.getInvoice);
router.get('/:id/pdf', InvoiceController_1.InvoiceController.generatePdf);
router.put('/:id', InvoiceController_1.InvoiceController.updateInvoice);
router.post('/:id/send', InvoiceController_1.InvoiceController.sendInvoice);
exports.default = router;
//# sourceMappingURL=invoices.js.map