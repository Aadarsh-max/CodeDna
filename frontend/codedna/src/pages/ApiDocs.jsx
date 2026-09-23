import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import reportApi from "../services/reportApi.js";
import useAnalysis from "../hooks/useAnalysis.js";

const markdownComponents = {
  h1: ({ children }) => <h1 className="font-display text-xl font-semibold mt-6 mb-2 first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="font-display text-lg font-semibold mt-5 mb-2">{children}</h2>,
  h3: ({ children }) => <h3 className="font-display text-base font-semibold mt-4 mb-1">{children}</h3>,
  p: ({ children }) => <p className="opacity-80 leading-relaxed mb-3">{children}</p>,
  ul: ({ children }) => <ul className="list-disc list-inside opacity-80 flex flex-col gap-1 mb-3">{children}</ul>,
  li: ({ children }) => <li>{children}</li>,
  pre: ({ children }) => (
    <pre className="font-mono text-sm bg-base-300 p-3 rounded-lg overflow-x-auto mb-3 shadow-clay-pressed">{children}</pre>
  ),
  code: ({ children }) => <code className="font-mono text-sm">{children}</code>,
  strong: ({ children }) => <strong className="font-semibold text-base-content">{children}</strong>,
  table: ({ children }) => (
    <div className="overflow-x-auto mb-4 rounded-lg shadow-clay-sm">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-base-300">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-base-300/60 last:border-0">{children}</tr>,
  th: ({ children }) => <th className="text-left font-display font-semibold px-3 py-2 whitespace-nowrap">{children}</th>,
  td: ({ children }) => <td className="px-3 py-2 align-top">{children}</td>,
};

const ApiDocs = () => {
  const { analysisId } = useParams();
  const { setCurrentAnalysisId } = useAnalysis();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const apiDocumentation = report.apiDocumentation;

  if (!apiDocumentation || apiDocumentation.total_routes === 0) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold">API Documentation</h1>
        <p className="opacity-60">No API routes were detected to document for this analysis.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-semibold">API Documentation</h1>
        <p className="opacity-60">
          AI-generated reference covering {apiDocumentation.documented_route_count} of {apiDocumentation.total_routes} detected routes
        </p>
      </div>

      <div className="bg-base-200 rounded-box shadow-clay p-6">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {apiDocumentation.api_reference}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default ApiDocs;