import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import reportApi from "../services/reportApi.js";
import analysisApi from "../services/analysisApi.js";
import useAnalysis from "../hooks/useAnalysis.js";

const buildFileMap = (analysis) => {
  const riskByFile = {};
  (analysis.riskModules?.predictions || []).forEach((p) => {
    riskByFile[p.file_path] = p;
  });

  const map = {};
  (analysis.metrics || []).forEach((m) => {
    const risk = riskByFile[m.file_path];
    map[m.file_path] = {
      complexity: m.complexity_score,
      riskLevel: risk?.risk_level || "Low",
      bugProbability: risk?.bug_probability ?? 0,
    };
  });
  return map;
};

const compareAnalyses = (olderAnalysis, newerAnalysis) => {
  const older = buildFileMap(olderAnalysis);
  const newer = buildFileMap(newerAnalysis);

  const allPaths = new Set([...Object.keys(older), ...Object.keys(newer)]);
  const changed = [];
  const added = [];
  const removed = [];

  allPaths.forEach((path) => {
    const before = older[path];
    const after = newer[path];

    if (!before && after) {
      added.push({ path, ...after });
      return;
    }
    if (before && !after) {
      removed.push({ path, ...before });
      return;
    }

    const complexityDelta = after.complexity - before.complexity;
    const bugDelta = after.bugProbability - before.bugProbability;

    if (complexityDelta !== 0 || bugDelta !== 0 || before.riskLevel !== after.riskLevel) {
      changed.push({
        path,
        complexityBefore: before.complexity,
        complexityAfter: after.complexity,
        complexityDelta,
        riskBefore: before.riskLevel,
        riskAfter: after.riskLevel,
        bugDelta,
      });
    }
  });

  changed.sort((a, b) => (Math.abs(b.complexityDelta) + Math.abs(b.bugDelta) * 100) - (Math.abs(a.complexityDelta) + Math.abs(a.bugDelta) * 100));

  return { changed, added, removed };
};

const DeltaBadge = ({ value, invert = false }) => {
  if (value === 0) return <span className="text-xs opacity-40">no change</span>;
  const isWorse = invert ? value < 0 : value > 0;
  const color = isWorse ? "text-error" : "text-primary";
  const arrow = value > 0 ? "↑" : "↓";
  return <span className={`text-xs font-semibold ${color}`}>{arrow} {Math.abs(value).toFixed(2)}</span>;
};

const Timeline = () => {
  const { analysisId } = useParams();
  const { setCurrentAnalysisId } = useAnalysis();
  const [history, setHistory] = useState([]);
  const [repoName, setRepoName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fromIndex, setFromIndex] = useState(null);
  const [toIndex, setToIndex] = useState(null);

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
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        setHistory(completed);
        if (completed.length >= 2) {
          setFromIndex(completed.length - 2);
          setToIndex(completed.length - 1);
        }
      } catch (err) {
        setError("Failed to load timeline");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [analysisId]);

  const chartData = useMemo(
    () =>
      history.map((a, i) => ({
        index: i + 1,
        date: new Date(a.createdAt).toLocaleDateString(),
        maintainability: Math.round(a.maintainabilityScore?.average_maintainability ?? 0),
        bugRisk: Math.round((a.riskModules?.average_bug_probability ?? 0) * 100),
        highRiskFiles: a.riskModules?.high_risk_file_count ?? 0,
      })),
    [history]
  );

  const comparison = useMemo(() => {
    if (fromIndex === null || toIndex === null || fromIndex === toIndex) return null;
    return compareAnalyses(history[fromIndex], history[toIndex]);
  }, [history, fromIndex, toIndex]);

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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Evolution Timeline</h1>
        <p className="opacity-60">
          {repoName} — {history.length} completed analysis{history.length !== 1 ? "es" : ""}
        </p>
      </div>

      {history.length < 2 ? (
        <div className="bg-base-200 rounded-box shadow-clay p-6">
          <p className="opacity-70">
            Only one completed analysis exists for this repository yet. Analyze it again later to start tracking how
            its maintainability and risk — and individual files — change over time.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-base-200 rounded-box shadow-clay p-6">
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="maintainability" name="Maintainability" stroke="#0E8C7E" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="bugRisk" name="Avg Bug Risk %" stroke="#C6493D" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="highRiskFiles" name="High Risk Files" stroke="#C98A2E" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold mb-3">File-by-File Comparison</h2>

            <div className="bg-base-200 rounded-box shadow-clay p-5 flex flex-wrap items-center gap-4 mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs opacity-60">From</label>
                <select
                  value={fromIndex ?? ""}
                  onChange={(e) => setFromIndex(Number(e.target.value))}
                  className="select select-bordered select-sm"
                >
                  {history.map((a, i) => (
                    <option key={a._id} value={i}>
                      {new Date(a.createdAt).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <span className="opacity-40 mt-5">→</span>

              <div className="flex flex-col gap-1">
                <label className="text-xs opacity-60">To</label>
                <select
                  value={toIndex ?? ""}
                  onChange={(e) => setToIndex(Number(e.target.value))}
                  className="select select-bordered select-sm"
                >
                  {history.map((a, i) => (
                    <option key={a._id} value={i}>
                      {new Date(a.createdAt).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!comparison ? (
              <p className="text-sm opacity-60">Select two different versions to compare.</p>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-base-200 rounded-box shadow-clay-sm p-4 text-center">
                    <span className="text-2xl font-display font-semibold">{comparison.changed.length}</span>
                    <p className="text-xs opacity-60 mt-1">Files Changed</p>
                  </div>
                  <div className="bg-base-200 rounded-box shadow-clay-sm p-4 text-center">
                    <span className="text-2xl font-display font-semibold text-primary">{comparison.added.length}</span>
                    <p className="text-xs opacity-60 mt-1">New Files</p>
                  </div>
                  <div className="bg-base-200 rounded-box shadow-clay-sm p-4 text-center">
                    <span className="text-2xl font-display font-semibold text-error">{comparison.removed.length}</span>
                    <p className="text-xs opacity-60 mt-1">Removed Files</p>
                  </div>
                </div>

                {comparison.changed.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {comparison.changed.map((file) => (
                      <div key={file.path} className="bg-base-200 rounded-box shadow-clay-sm p-4 flex items-center gap-4 flex-wrap">
                        <span className="font-mono text-sm flex-1 min-w-[180px]">{file.path}</span>
                        <div className="flex flex-col items-end text-xs opacity-60">
                          <span>Complexity {file.complexityBefore} → {file.complexityAfter}</span>
                          <DeltaBadge value={file.complexityDelta} />
                        </div>
                        <div className="flex flex-col items-end text-xs opacity-60">
                          <span>Risk {file.riskBefore} → {file.riskAfter}</span>
                          <DeltaBadge value={file.bugDelta} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {comparison.added.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold opacity-70 mb-2">New files</h3>
                    <div className="flex flex-wrap gap-2">
                      {comparison.added.map((f) => (
                        <span key={f.path} className="font-mono text-xs bg-base-300 rounded-lg px-2 py-1 shadow-clay-pressed">
                          {f.path}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {comparison.removed.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold opacity-70 mb-2">Removed files</h3>
                    <div className="flex flex-wrap gap-2">
                      {comparison.removed.map((f) => (
                        <span key={f.path} className="font-mono text-xs bg-base-300 rounded-lg px-2 py-1 shadow-clay-pressed">
                          {f.path}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {comparison.changed.length === 0 && comparison.added.length === 0 && comparison.removed.length === 0 && (
                  <p className="text-sm opacity-60">No meaningful file-level differences between these two versions.</p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Timeline;