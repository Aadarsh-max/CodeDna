import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getReport,
  createRefactorPlan,
  updateStepStatus,
} from "../controllers/reportController.js";

const router = express.Router();

router.use(protect);

router.get("/:analysisId", getReport);
router.post("/:analysisId/refactor-plan", createRefactorPlan);
router.patch("/refactor-plan/:planId/step/:stepId", updateStepStatus);

export default router;