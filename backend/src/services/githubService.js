import axios from "axios";

export const parseGithubUrl = (url) => {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    throw new Error("Invalid GitHub URL");
  }
  return { owner: match[1], repo: match[2].replace(".git", "") };
};

export const fetchRepoMetadata = async (owner, repo) => {
  const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`);
  const data = response.data;
  return {
    name: data.name,
    description: data.description,
    defaultBranch: data.default_branch,
    language: data.language,
    stars: data.stargazers_count,
  };
};