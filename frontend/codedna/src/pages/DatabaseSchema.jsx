import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import reportApi from "../services/reportApi.js";
import useAnalysis from "../hooks/useAnalysis.js";
import DatabaseDiagram from "../components/graph/DatabaseDiagram.jsx";

const DatabaseSchema = () => {
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

  const databaseSchema = report.databaseSchema;

  if (!databaseSchema) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold">Database Relationships</h1>
        <p className="text-sm opacity-60">No database schema data available for this analysis.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Database Relationships</h1>
        <p className="text-sm opacity-60">
          {databaseSchema.entity_count} entit{databaseSchema.entity_count !== 1 ? "ies" : "y"} detected
          {databaseSchema.entity_count === 0 && " — currently supports Mongoose schemas only"}
        </p>
      </div>

      <DatabaseDiagram entities={databaseSchema.entities} relationships={databaseSchema.relationships} />

      {databaseSchema.entities.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {databaseSchema.entities.map((entity) => (
            <div key={entity.name} className="bg-base-200 rounded-box shadow-clay-sm p-5 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-display font-semibold text-sm">{entity.name}</span>
                <span className="font-mono text-xs opacity-50">{entity.file_path}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {entity.fields.map((field) => (
                  <span key={field} className="font-mono text-xs bg-base-300 rounded-lg px-2 py-1 shadow-clay-pressed">
                    {field}
                  </span>
                ))}
              </div>
              {entity.relationships.length > 0 && (
                <div className="text-xs opacity-70 mt-1 flex flex-col gap-0.5">
                  {entity.relationships.map((rel, i) => (
                    <div key={i}>
                      <span className="font-mono">{rel.field}</span> → references <span className="font-mono">{rel.references}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DatabaseSchema;