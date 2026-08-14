import express from "express";
import { protect } from "../middleware/auth.js";
import {
  startAnalysis,
  getAnalysisById,
  getAnalysesByRepo,
} from "../controllers/analysisController.js";

const router = express.Router();

router.use(protect);

router.post("/:repoId/start", startAnalysis);
router.get("/repo/:repoId", getAnalysesByRepo);
router.get("/:id", getAnalysisById);

export default router;