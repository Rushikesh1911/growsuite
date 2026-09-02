"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const WebToLeadController_1 = require("../controllers/WebToLeadController");
const router = (0, express_1.Router)();
// Public routes for embedding and submitting
router.get('/public/:publicId', WebToLeadController_1.WebToLeadController.getPublicFormConfig);
router.post('/public/:publicId/submit', WebToLeadController_1.WebToLeadController.submitForm);
// Protected routes for managing forms
router.use(auth_1.requireAuth);
router.get('/', WebToLeadController_1.WebToLeadController.getForms);
router.post('/', WebToLeadController_1.WebToLeadController.createForm);
router.put('/:id', WebToLeadController_1.WebToLeadController.updateForm);
router.delete('/:id', WebToLeadController_1.WebToLeadController.deleteForm);
exports.default = router;
//# sourceMappingURL=webToLead.js.map