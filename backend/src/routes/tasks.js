"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const workspaceAuth_1 = require("../middleware/workspaceAuth");
const TaskController_1 = require("../controllers/TaskController");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.use(workspaceAuth_1.requireWorkspaceAccess);
router.get('/', TaskController_1.TaskController.getAllTasks);
router.post('/', TaskController_1.TaskController.createTask);
router.put('/:id', TaskController_1.TaskController.updateTask);
router.delete('/:id', TaskController_1.TaskController.deleteTask);
exports.default = router;
//# sourceMappingURL=tasks.js.map