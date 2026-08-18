import { createContext, useState } from "react";

export const AnalysisContext = createContext(null);

export const AnalysisProvider = ({ children }) => {
  const [currentAnalysisId, setCurrentAnalysisIdState] = useState(
    () => localStorage.getItem("codedna_last_analysis") || null
  );

  const setCurrentAnalysisId = (id) => {
    setCurrentAnalysisIdState(id);
    if (id) {
      localStorage.setItem("codedna_last_analysis", id);
    }
  };

  return (
    <AnalysisContext.Provider value={{ currentAnalysisId, setCurrentAnalysisId }}>
      {children}
    </AnalysisContext.Provider>
  );
};