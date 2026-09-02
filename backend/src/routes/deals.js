"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const workspaceAuth_1 = require("../middleware/workspaceAuth");
const DealController_1 = require("../controllers/DealController");
const router = (0, express_1.Router)();
// Apply auth & workspace authorization to all routes in this module
router.use(auth_1.requireAuth);
router.use(workspaceAuth_1.requireWorkspaceAccess);
router.get('/', DealController_1.DealController.getDeals);
router.post('/', DealController_1.DealController.createDeal);
router.put('/:id', DealController_1.DealController.updateDeal);
router.post('/:id/convert', DealController_1.DealController.convertDeal);
router.post('/:id/notes', DealController_1.DealController.addNote);
router.post('/:id/activities', DealController_1.DealController.addActivity);
exports.default = router;
//# sourceMappingURL=deals.js.map