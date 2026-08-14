import { Repository } from "../models/Repository.js";
import { parseGithubUrl, fetchRepoMetadata } from "../services/githubService.js";

export const importFromGithub = async (req, res) => {
  const { githubUrl } = req.body;

  const { owner, repo } = parseGithubUrl(githubUrl);
  const metadata = await fetchRepoMetadata(owner, repo);

  const repository = await Repository.create({
    user: req.user._id,
    source: "github",
    name: metadata.name,
    description: metadata.description,
    githubUrl,
    defaultBranch: metadata.defaultBranch,
    language: metadata.language,
  });

  res.status(201).json(repository);
};

export const importFromZip = async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  const repository = await Repository.create({
    user: req.user._id,
    source: "zip",
    name: req.file.originalname,
    zipPath: req.file.path,
  });

  res.status(201).json(repository);
};

export const getRepos = async (req, res) => {
  const repos = await Repository.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(repos);
};

export const getRepoById = async (req, res) => {
  const repo = await Repository.findOne({ _id: req.params.id, user: req.user._id });

  if (!repo) {
    res.status(404);
    throw new Error("Repository not found");
  }

  res.status(200).json(repo);
};