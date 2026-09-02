"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const workspaceAuth_1 = require("../middleware/workspaceAuth");
const LeadController_1 = require("../controllers/LeadController");
const router = (0, express_1.Router)();
// Public Web-to-Lead endpoint
router.post('/web', LeadController_1.LeadController.createFromWeb);
// Apply auth & workspace authorization to all routes in this module
router.use(auth_1.requireAuth);
router.use(workspaceAuth_1.requireWorkspaceAccess);
router.get('/', LeadController_1.LeadController.getLeads);
router.post('/import', LeadController_1.LeadController.importLeads);
router.get('/:id', LeadController_1.LeadController.getLeadById);
router.post('/', LeadController_1.LeadController.createLead);
router.patch('/bulk-archive', LeadController_1.LeadController.bulkArchive);
router.put('/:id', LeadController_1.LeadController.updateLead);
router.patch('/:id', LeadController_1.LeadController.updateLead);
router.post('/:id/convert-to-deal', LeadController_1.LeadController.convertToDeal);
router.post('/:id/email', LeadController_1.LeadController.sendEmail);
router.post('/:id/notes', LeadController_1.LeadController.addNote);
router.post('/:id/activities', LeadController_1.LeadController.addActivity);
exports.default = router;
//# sourceMappingURL=leads.js.map