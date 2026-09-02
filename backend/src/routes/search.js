"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const workspaceAuth_1 = require("../middleware/workspaceAuth");
const SearchController_1 = require("../controllers/SearchController");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.use(workspaceAuth_1.requireWorkspaceAccess);
router.get('/', SearchController_1.SearchController.globalSearch);
exports.default = router;
//# sourceMappingURL=search.js.map