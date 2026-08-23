import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import repoApi from "../services/repoApi.js";
import analysisApi from "../services/analysisApi.js";
import usePolling from "../hooks/usePolling.js";
import useToast from "../hooks/useToast.js";

const RepoImport = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("github");
  const [githubUrl, setGithubUrl] = useState("");
  const [file, setFile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [lastAnalysisByRepo, setLastAnalysisByRepo] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeAnalysisId, setActiveAnalysisId] = useState(null);
  const [startingRepoId, setStartingRepoId] = useState(null);

  const { analysis } = usePolling(activeAnalysisId);

  const loadRepos = async () => {
    try {
      const data = await repoApi.getRepos();
      setRepos(data);

      const entries = await Promise.all(
        data.map(async (repo) => {
          try {
            const analyses = await analysisApi.getAnalysesForRepo(repo._id);
            const completed = analyses.find((a) => a.status === "completed");
            return [repo._id, completed?._id || null];
          } catch {
            return [repo._id, null];
          }
        }),
      );
      setLastAnalysisByRepo(Object.fromEntries(entries));
    } catch (err) {
      showToast("Failed to load repositories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepos();
  }, []);

  useEffect(() => {
    if (analysis?.status === "completed") {
      navigate(`/dashboard/${analysis._id}`);
    }
  }, [analysis, navigate]);

  const handleGithubSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await repoApi.importFromGithub(githubUrl);
      setGithubUrl("");
      await loadRepos();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to import repository");
    } finally {
      setSubmitting(false);
    }
  };

  const handleZipSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    try {
      await repoApi.importFromZip(file);
      setFile(null);
      await loadRepos();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to upload ZIP");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnalyze = async (repoId) => {
    setStartingRepoId(repoId);
    try {
      const result = await analysisApi.startAnalysis(repoId);
      setActiveAnalysisId(result._id);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to start analysis");
    } finally {
      setStartingRepoId(null);
    }
  };

  const isAnalyzing = activeAnalysisId && analysis?.status !== "failed";

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-7 sm:gap-8">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-semibold mb-1 text-base-content">
          Import a Repository
        </h1>
        <p className="text-sm text-base-content/55">
          Connect a GitHub repo or upload a ZIP to begin analysis.
        </p>
      </div>

      <div className="bg-linear-to-br from-base-100 to-base-200 shadow-clay rounded-[1.5rem] p-5 sm:p-6">
        <div role="tablist" className="flex gap-1 p-1 rounded-field bg-base-200 shadow-clay-pressed w-fit mb-6 overflow-x-auto">
          <button
            role="tab"
            onClick={() => setActiveTab("github")}
            className={`px-3 sm:px-4 py-1.5 rounded-field text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeTab === "github"
                ? "bg-base-100 shadow-clay-sm text-primary"
                : "text-base-content/55 hover:text-base-content"
            }`}
          >
            GitHub URL
          </button>
          <button
            role="tab"
            onClick={() => setActiveTab("zip")}
            className={`px-3 sm:px-4 py-1.5 rounded-field text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeTab === "zip"
                ? "bg-base-100 shadow-clay-sm text-primary"
                : "text-base-content/55 hover:text-base-content"
            }`}
          >
            Upload ZIP
          </button>
        </div>

        {activeTab === "github" ? (
          <form onSubmit={handleGithubSubmit} className="flex flex-col gap-4">
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              required
              className="w-full rounded-field bg-base-100 border border-base-300/60 px-4 py-2.5 font-mono text-sm text-base-content placeholder:text-base-content/30 shadow-clay-pressed focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow duration-200"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-field bg-primary text-primary-content font-medium px-5 py-2.5 shadow-clay-sm hover:shadow-clay hover:-translate-y-0.5 active:translate-y-0 active:shadow-clay-pressed transition-all duration-200 disabled:opacity-60 disabled:hover:translate-y-0 w-fit flex items-center gap-2"
            >
              {submitting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Import Repository"
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleZipSubmit} className="flex flex-col gap-4">
            <input
              type="file"
              accept=".zip"
              onChange={(e) => setFile(e.target.files[0])}
              required
              className="file-input w-full rounded-field bg-base-100 border border-base-300/60 shadow-clay-pressed file:cursor-pointer"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-field bg-primary text-primary-content font-medium px-5 py-2.5 shadow-clay-sm hover:shadow-clay hover:-translate-y-0.5 active:translate-y-0 active:shadow-clay-pressed transition-all duration-200 disabled:opacity-60 disabled:hover:translate-y-0 w-fit flex items-center gap-2"
            >
              {submitting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Upload & Import"
              )}
            </button>
          </form>
        )}
      </div>

      {isAnalyzing && (
        <div className="bg-linear-to-br from-base-100 to-base-200 shadow-clay rounded-[1.5rem] p-5 sm:p-6 flex items-center gap-4 ring-1 ring-primary/15">
          <span className="loading loading-spinner loading-md text-primary shrink-0"></span>
          <div>
            <p className="font-medium text-base-content">Analyzing repository...</p>
            <p className="text-sm text-base-content/55">
              This runs parsing, risk prediction, maintainability scoring,
              refactor planning, and documentation generation. Can take a minute
              or more, especially for larger repos.
            </p>
          </div>
        </div>
      )}

      {analysis?.status === "failed" && (
        <div className="bg-linear-to-br from-base-100 to-base-200 shadow-clay rounded-[1.5rem] p-5 sm:p-6 ring-1 ring-error/20">
          <p className="text-error font-medium">Analysis failed</p>
          <p className="text-sm text-base-content/60 mt-1">{analysis.error}</p>
          <button
            onClick={() => setActiveAnalysisId(null)}
            className="rounded-field text-sm font-medium px-4 py-1.5 mt-3 text-base-content/60 hover:text-base-content hover:bg-base-300/40 transition-colors duration-150"
          >
            Dismiss
          </button>
        </div>
      )}

      <div>
        <h2 className="font-display text-base sm:text-lg font-semibold mb-3 text-base-content">
          Your Repositories
        </h2>

        {loading ? (
          <div className="flex flex-col gap-3">
            <div className="skeleton h-20 w-full rounded-[1.5rem]"></div>
            <div className="skeleton h-20 w-full rounded-[1.5rem]"></div>
          </div>
        ) : repos.length === 0 ? (
          <p className="text-sm text-base-content/55">No repositories imported yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {repos.map((repo) => (
              <div
                key={repo._id}
                className="bg-linear-to-br from-base-100 to-base-200 shadow-clay-sm hover:shadow-clay rounded-[1.5rem] transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="p-4 sm:p-5 flex flex-col gap-3">
                  <div className="min-w-0">
                    <h3 className="font-mono text-sm font-medium text-base-content truncate">
                      {repo.name}
                    </h3>
                    <div className="flex gap-2 items-center text-xs text-base-content/55 mt-1">
                      <span className="px-2 py-0.5 rounded-full bg-base-200 shadow-clay-pressed text-[11px] font-medium">
                        {repo.source}
                      </span>
                      {repo.language && <span>{repo.language}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => handleAnalyze(repo._id)}
                      disabled={startingRepoId === repo._id || isAnalyzing}
                      className="rounded-field bg-primary text-primary-content text-sm font-medium px-4 py-1.5 shadow-clay-sm hover:shadow-clay hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:hover:translate-y-0 w-fit flex items-center gap-2"
                    >
                      {startingRepoId === repo._id ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        "Analyze"
                      )}
                    </button>
                    {lastAnalysisByRepo[repo._id] && (
                      <Link
                        to={`/dashboard/${lastAnalysisByRepo[repo._id]}`}
                        className="text-xs text-primary hover:underline underline-offset-4 cursor-pointer"
                      >
                        View Last Report →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RepoImport;