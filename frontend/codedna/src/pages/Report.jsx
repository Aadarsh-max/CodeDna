import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import reportApi from "../services/reportApi.js";
import useAnalysis from "../hooks/useAnalysis.js";

const markdownComponents = {
  h1: ({ children }) => (
    <h1 className="font-display text-xl font-semibold mt-6 mb-2 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-display text-lg font-semibold mt-5 mb-2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-display text-base font-semibold mt-4 mb-1">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-sm opacity-80 leading-relaxed mb-3">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside text-sm opacity-80 flex flex-col gap-1 mb-3">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside text-sm opacity-80 flex flex-col gap-1 mb-3">
      {children}
    </ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  pre: ({ children }) => (
    <pre className="font-mono text-xs bg-base-300 p-3 rounded-box overflow-x-auto mb-3">
      {children}
    </pre>
  ),
  code: ({ children }) => <code className="font-mono text-xs">{children}</code>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-base-content">{children}</strong>
  ),
};

const Report = () => {
  const { analysisId } = useParams();
  const { setCurrentAnalysisId } = useAnalysis();

  useEffect(() => {
    setCurrentAnalysisId(analysisId);
  }, [analysisId, setCurrentAnalysisId]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    reportApi
      .getReport(analysisId)
      .then(setReport)
      .catch(() => setError("Failed to load report"))
      .finally(() => setLoading(false));
  }, [analysisId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error || !report) {
    return <p className="text-error">{error || "Report not found"}</p>;
  }

  const { documentation, repository } = report;

  if (!documentation) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold">Report</h1>
        <p className="text-sm opacity-60">
          No documentation was generated for this analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-semibold">Report</h1>
        <p className="text-sm opacity-60">
          AI-generated documentation for {repository?.name}
        </p>
      </div>

      <div role="tablist" className="tabs tabs-boxed w-fit">
        <button
          role="tab"
          onClick={() => setActiveTab("summary")}
          className={`tab ${activeTab === "summary" ? "tab-active" : ""}`}
        >
          Summary
        </button>
        <button
          role="tab"
          onClick={() => setActiveTab("readme")}
          className={`tab ${activeTab === "readme" ? "tab-active" : ""}`}
        >
          README
        </button>
        <button
          role="tab"
          onClick={() => setActiveTab("insights")}
          className={`tab ${activeTab === "insights" ? "tab-active" : ""}`}
        >
          Insights
        </button>
      </div>

      <div className="bg-base-200 border border-base-300 rounded-box p-6">
        {activeTab === "summary" && (
          <p className="text-sm opacity-80 leading-relaxed">
            {documentation.summary}
          </p>
        )}

        {activeTab === "readme" &&
          (documentation.readme ? (
            <ReactMarkdown components={markdownComponents}>
              {documentation.readme}
            </ReactMarkdown>
          ) : (
            <p className="text-sm opacity-60">
              No README content was generated.
            </p>
          ))}

        {activeTab === "insights" &&
          (documentation.insights?.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {documentation.insights.map((insight, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="text-primary font-mono text-xs mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm opacity-80">{insight}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm opacity-60">No insights were generated.</p>
          ))}
      </div>
    </div>
  );
};

export default Report;
