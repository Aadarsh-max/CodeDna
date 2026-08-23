import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import reportApi from "../services/reportApi.js";
import useAnalysis from "../hooks/useAnalysis.js";
import { generateReportPdf } from "../utils/pdfGenerator.js";

const markdownComponents = {
  h1: ({ children }) => <h1 className="font-display text-xl font-semibold mt-6 mb-2 first:mt-0 text-base-content">{children}</h1>,
  h2: ({ children }) => <h2 className="font-display text-lg font-semibold mt-5 mb-2 text-base-content">{children}</h2>,
  h3: ({ children }) => <h3 className="font-display text-base font-semibold mt-4 mb-1 text-base-content">{children}</h3>,
  p: ({ children }) => <p className="text-sm text-base-content/75 leading-relaxed mb-3">{children}</p>,
  ul: ({ children }) => <ul className="list-disc list-inside text-sm text-base-content/75 flex flex-col gap-1 mb-3">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside text-sm text-base-content/75 flex flex-col gap-1 mb-3">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  pre: ({ children }) => (
    <pre className="font-mono text-xs bg-base-300/60 shadow-clay-pressed p-3 rounded-field overflow-x-auto mb-3">{children}</pre>
  ),
  code: ({ children }) => <code className="font-mono text-xs">{children}</code>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 cursor-pointer">
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-base-content">{children}</strong>,
};

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "readme", label: "README" },
  { key: "insights", label: "Insights" },
  { key: "recommendations", label: "Recommendations" },
];

const Report = () => {
  const { analysisId } = useParams();
  const { setCurrentAnalysisId } = useAnalysis();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setCurrentAnalysisId(analysisId);
  }, [analysisId, setCurrentAnalysisId]);

  useEffect(() => {
    reportApi
      .getReport(analysisId)
      .then(setReport)
      .catch(() => setError("Failed to load report"))
      .finally(() => setLoading(false));
  }, [analysisId]);

  const handleExport = () => {
    setExporting(true);
    try {
      generateReportPdf(report);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error || !report) {
    return (
      <p className="text-error text-sm bg-error/10 border border-error/20 rounded-field px-4 py-3 inline-block">
        {error || "Report not found"}
      </p>
    );
  }

  const { documentation, repository } = report;

  if (!documentation) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-xl sm:text-2xl font-semibold text-base-content">Report</h1>
        <p className="text-sm text-base-content/55">No documentation was generated for this analysis.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6 max-w-3xl">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-semibold text-base-content">Report</h1>
          <p className="text-sm text-base-content/55">AI-generated documentation for {repository?.name}</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="rounded-field bg-primary text-primary-content text-sm font-medium px-4 py-2 shadow-clay-sm hover:shadow-clay hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:hover:translate-y-0 flex items-center gap-2"
        >
          {exporting ? <span className="loading loading-spinner loading-xs"></span> : "Export PDF"}
        </button>
      </div>

      <div role="tablist" className="flex gap-1 p-1 rounded-field bg-base-200 shadow-clay-pressed w-full sm:w-fit overflow-x-auto">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            onClick={() => setActiveTab(key)}
            className={`px-3 sm:px-4 py-1.5 rounded-field text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeTab === key
                ? "bg-base-100 shadow-clay-sm text-primary"
                : "text-base-content/55 hover:text-base-content"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-linear-to-br from-base-100 to-base-200 shadow-clay rounded-[1.5rem] p-5 sm:p-6">
        {activeTab === "overview" && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="font-display text-sm font-semibold text-primary mb-2">Summary</h3>
              <p className="text-sm text-base-content/75 leading-relaxed">{documentation.summary || "Not available."}</p>
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-primary mb-2">Architecture Overview</h3>
              <p className="text-sm text-base-content/75 leading-relaxed">{documentation.architecture_overview || "Not available."}</p>
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-primary mb-2">Quality Assessment</h3>
              <p className="text-sm text-base-content/75 leading-relaxed">{documentation.quality_assessment || "Not available."}</p>
            </div>
          </div>
        )}

        {activeTab === "readme" &&
          (documentation.readme ? (
            <ReactMarkdown components={markdownComponents}>{documentation.readme}</ReactMarkdown>
          ) : (
            <p className="text-sm text-base-content/55">No README content was generated.</p>
          ))}

        {activeTab === "insights" &&
          (documentation.insights?.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {documentation.insights.map((insight, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="text-primary font-mono text-xs mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-sm text-base-content/75">{insight}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-base-content/55">No insights were generated.</p>
          ))}

        {activeTab === "recommendations" && (
          <p className="text-sm text-base-content/75 leading-relaxed">{documentation.recommendations || "No recommendations were generated."}</p>
        )}
      </div>
    </div>
  );
};

export default Report;