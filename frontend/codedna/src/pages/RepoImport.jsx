import { useState, useEffect } from "react";
import repoApi from "../services/repoApi.js";

const RepoImport = () => {
  const [activeTab, setActiveTab] = useState("github");
  const [githubUrl, setGithubUrl] = useState("");
  const [file, setFile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadRepos = async () => {
    try {
      const data = await repoApi.getRepos();
      setRepos(data);
    } catch (err) {
      setError("Failed to load repositories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepos();
  }, []);

  const handleGithubSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await repoApi.importFromGithub(githubUrl);
      setGithubUrl("");
      await loadRepos();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to import repository");
    } finally {
      setSubmitting(false);
    }
  };

  const handleZipSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setError("");
    setSubmitting(true);

    try {
      await repoApi.importFromZip(file);
      setFile(null);
      await loadRepos();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload ZIP");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold mb-1">Import a Repository</h1>
        <p className="text-sm opacity-60">Connect a GitHub repo or upload a ZIP to begin analysis.</p>
      </div>

      <div className="bg-base-200 border border-base-300 rounded-box p-6">
        <div role="tablist" className="tabs tabs-boxed w-fit mb-6">
          <button
            role="tab"
            onClick={() => setActiveTab("github")}
            className={`tab ${activeTab === "github" ? "tab-active" : ""}`}
          >
            GitHub URL
          </button>
          <button
            role="tab"
            onClick={() => setActiveTab("zip")}
            className={`tab ${activeTab === "zip" ? "tab-active" : ""}`}
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
              className="input input-bordered w-full font-mono text-sm"
            />
            <button type="submit" disabled={submitting} className="btn btn-primary w-fit">
              {submitting ? <span className="loading loading-spinner loading-sm"></span> : "Import Repository"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleZipSubmit} className="flex flex-col gap-4">
            <input
              type="file"
              accept=".zip"
              onChange={(e) => setFile(e.target.files[0])}
              required
              className="file-input file-input-bordered w-full"
            />
            <button type="submit" disabled={submitting} className="btn btn-primary w-fit">
              {submitting ? <span className="loading loading-spinner loading-sm"></span> : "Upload & Import"}
            </button>
          </form>
        )}

        {error && <p className="text-error text-sm mt-4">{error}</p>}
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold mb-3">Your Repositories</h2>

        {loading ? (
          <span className="loading loading-spinner loading-md text-primary"></span>
        ) : repos.length === 0 ? (
          <p className="text-sm opacity-60">No repositories imported yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {repos.map((repo) => (
              <div key={repo._id} className="card bg-base-200 border border-base-300">
                <div className="card-body p-4">
                  <h3 className="font-mono text-sm font-medium">{repo.name}</h3>
                  <div className="flex gap-2 items-center text-xs opacity-60">
                    <span className="badge badge-sm badge-neutral">{repo.source}</span>
                    {repo.language && <span>{repo.language}</span>}
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