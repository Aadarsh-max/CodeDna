import express from "express";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { githubImportValidation } from "../validators/repoValidators.js";
import {
  importFromGithub,
  importFromZip,
  getRepos,
  getRepoById,
} from "../controllers/repoController.js";

const router = express.Router();

router.use(protect);

router.post("/github", githubImportValidation, validate, importFromGithub);
router.post("/upload", upload.single("file"), importFromZip);
router.get("/", getRepos);
router.get("/:id", getRepoById);

export default router;