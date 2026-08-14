import { body } from "express-validator";

export const githubImportValidation = [
  body("githubUrl")
    .trim()
    .notEmpty()
    .withMessage("GitHub URL is required")
    .matches(/^https:\/\/github\.com\/[^/]+\/[^/]+/)
    .withMessage("Must be a valid GitHub repository URL"),
];