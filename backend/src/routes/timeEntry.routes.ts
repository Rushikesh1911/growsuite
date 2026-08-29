import { Router } from "express";
import { 
  createTimeEntry, 
  getTimeEntries, 
  updateTimeEntry, 
  deleteTimeEntry 
} from "../controllers/TimeEntryController";
import { requireAuth } from "../middleware/auth";

const router = Router({ mergeParams: true });

router.use(requireAuth);

// These routes assume they are mounted under /workspaces/:workspaceId/time-entries
router.post("/", createTimeEntry);
router.get("/", getTimeEntries);
router.put("/:id", updateTimeEntry);
router.delete("/:id", deleteTimeEntry);

export default router;
