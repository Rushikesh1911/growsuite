"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const workspaceAuth_1 = require("../middleware/workspaceAuth");
const ClientController_1 = require("../controllers/ClientController");
const router = (0, express_1.Router)();
// Apply auth & workspace authorization to all routes in this module
router.use(auth_1.requireAuth);
router.use(workspaceAuth_1.requireWorkspaceAccess);
router.get('/', ClientController_1.ClientController.getClients);
router.post('/import', ClientController_1.ClientController.importClients);
router.get('/:id', ClientController_1.ClientController.getClient);
router.post('/', ClientController_1.ClientController.createClient);
router.put('/:id', ClientController_1.ClientController.updateClient);
router.patch('/:id/archive', ClientController_1.ClientController.archiveClient);
router.patch('/bulk-archive', ClientController_1.ClientController.bulkArchiveClients);
router.post('/:id/notes', ClientController_1.ClientController.addNote);
router.post('/:id/activities', ClientController_1.ClientController.addActivity);
exports.default = router;
//# sourceMappingURL=clients.js.map