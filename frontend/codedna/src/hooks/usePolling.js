import { useEffect, useState } from "react";
import analysisApi from "../services/analysisApi.js";

const TERMINAL_STATUSES = ["completed", "failed"];

const usePolling = (analysisId, interval = 3000) => {
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!analysisId) return;

    let cancelled = false;
    let timeoutId;

    const poll = async () => {
      try {
        const result = await analysisApi.getAnalysis(analysisId);
        if (cancelled) return;
        setAnalysis(result);

        if (!TERMINAL_STATUSES.includes(result.status)) {
          timeoutId = setTimeout(poll, interval);
        }
      } catch (err) {
        if (!cancelled) setError(err);
      }
    };

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [analysisId, interval]);

  return { analysis, error };
};

export default usePolling;