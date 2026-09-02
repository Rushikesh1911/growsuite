"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TimeEntryController_1 = require("../controllers/TimeEntryController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)({ mergeParams: true });
router.use(auth_1.requireAuth);
// These routes assume they are mounted under /workspaces/:workspaceId/time-entries
router.post("/", TimeEntryController_1.createTimeEntry);
router.get("/", TimeEntryController_1.getTimeEntries);
router.put("/:id", TimeEntryController_1.updateTimeEntry);
router.delete("/:id", TimeEntryController_1.deleteTimeEntry);
exports.default = router;
//# sourceMappingURL=timeEntry.routes.js.map