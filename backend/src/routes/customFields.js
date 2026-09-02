"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const workspaceAuth_1 = require("../middleware/workspaceAuth");
const CustomFieldController_1 = require("../controllers/CustomFieldController");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.use(workspaceAuth_1.requireWorkspaceAccess);
router.get('/', CustomFieldController_1.CustomFieldController.getFields);
router.post('/', CustomFieldController_1.CustomFieldController.createField);
router.put('/:id', CustomFieldController_1.CustomFieldController.updateField);
router.delete('/:id', CustomFieldController_1.CustomFieldController.deleteField);
exports.default = router;
//# sourceMappingURL=customFields.js.map