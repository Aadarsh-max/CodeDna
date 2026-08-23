import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import reportApi from "../services/reportApi.js";
import analysisApi from "../services/analysisApi.js";
import useAnalysis from "../hooks/useAnalysis.js";

const Timeline = () => {
  const { analysisId } = useParams();
  const { setCurrentAnalysisId } = useAnalysis();
  const [history, setHistory] = useState([]);
  const [repoName, setRepoName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setCurrentAnalysisId(analysisId);
  }, [analysisId, setCurrentAnalysisId]);

  useEffect(() => {
    const load = async () => {
      try {
        const report = await reportApi.getReport(analysisId);
        setRepoName(report.repository?.name || "");

        const analyses = await analysisApi.getAnalysesForRepo(report.repository._id);
        const completed = analyses
          .filter((a) => a.status === "completed")
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          .map((a, i) => ({
            index: i + 1,
            date: new Date(a.createdAt).toLocaleDateString(),
            maintainability: Math.round(a.maintainabilityScore?.average_maintainability ?? 0),
            bugRisk: Math.round((a.riskModules?.average_bug_probability ?? 0) * 100),
            highRiskFiles: a.riskModules?.high_risk_file_count ?? 0,
          }));

        setHistory(completed);
      } catch (err) {
        setError("Failed to load timeline");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [analysisId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-error text-sm bg-error/10 border border-error/20 rounded-field px-4 py-3 inline-block">
        {error}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-semibold text-base-content">Evolution Timeline</h1>
        <p className="text-sm text-base-content/55">
          {repoName} — {history.length} completed analysis{history.length !== 1 ? "es" : ""}
        </p>
      </div>

      {history.length < 2 ? (
        <div className="bg-linear-to-br from-base-100 to-base-200 shadow-clay rounded-[1.5rem] p-5 sm:p-6">
          <p className="text-sm text-base-content/70">
            Only one completed analysis exists for this repository yet. Analyze it again after making changes to
            start tracking how its maintainability and risk change over time.
          </p>
        </div>
      ) : (
        <div className="bg-base-200 shadow-clay-pressed rounded-[1.5rem] p-4 sm:p-6">
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={history} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DEDACC" />
              <XAxis dataKey="date" stroke="#1B221E" tick={{ fontSize: 12, fill: "#1B221E", opacity: 0.55 }} />
              <YAxis stroke="#1B221E" tick={{ fontSize: 12, fill: "#1B221E", opacity: 0.55 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#F1EFE8", border: "1px solid #DEDACC", borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: "#1B221E" }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="maintainability" name="Maintainability" stroke="#0E8C7E" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="bugRisk" name="Avg Bug Risk %" stroke="#C6493D" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="highRiskFiles" name="High Risk Files" stroke="#C98A2E" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Timeline;