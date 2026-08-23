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
    return <p className="text-error">{error}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold">Evolution Timeline</h1>
        <p className="text-sm opacity-60">
          {repoName} — {history.length} completed analysis{history.length !== 1 ? "es" : ""}
        </p>
      </div>

      {history.length < 2 ? (
        <div className="bg-base-200 border border-base-300 rounded-box p-6">
          <p className="text-sm opacity-70">
            Only one completed analysis exists for this repository yet. Analyze it again after making changes to start tracking how its maintainability and risk change over time.
          </p>
        </div>
      ) : (
        <div className="bg-base-200 border border-base-300 rounded-box p-6">
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={history} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1F2B" />
              <XAxis dataKey="date" stroke="#E8EAED" tick={{ fontSize: 12, fill: "#E8EAED", opacity: 0.6 }} />
              <YAxis stroke="#E8EAED" tick={{ fontSize: 12, fill: "#E8EAED", opacity: 0.6 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#12161F", border: "1px solid #1A1F2B", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#E8EAED" }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="maintainability" name="Maintainability" stroke="#5EEAD4" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="bugRisk" name="Avg Bug Risk %" stroke="#F0554B" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="highRiskFiles" name="High Risk Files" stroke="#F2B84B" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Timeline;