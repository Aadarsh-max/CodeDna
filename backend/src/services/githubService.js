import axios from "axios";

export const parseGithubUrl = (url) => {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    throw new Error("Invalid GitHub URL");
  }
  return { owner: match[1], repo: match[2].replace(".git", "") };
};

export const fetchRepoMetadata = async (owner, repo) => {
  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`);
    const data = response.data;
    return {
      name: data.name,
      description: data.description,
      defaultBranch: data.default_branch,
      language: data.language,
      stars: data.stargazers_count,
    };
  } catch (error) {
    if (error.response?.status === 404) {
      const notFoundError = new Error(
        `Repository "${owner}/${repo}" not found. Check the URL is correct and the repository is public.`
      );
      notFoundError.statusCode = 400;
      throw notFoundError;
    }

    if (error.response?.status === 403) {
      const rateLimitError = new Error("GitHub API rate limit exceeded. Please try again in a few minutes.");
      rateLimitError.statusCode = 429;
      throw rateLimitError;
    }

    const genericError = new Error("Failed to fetch repository from GitHub.");
    genericError.statusCode = 502;
    throw genericError;
  }
};