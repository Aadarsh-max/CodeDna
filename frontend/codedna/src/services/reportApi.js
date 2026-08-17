import api from "./api.js";

const getReport = async (analysisId) => {
  const response = await api.get(`/reports/${analysisId}`);
  return response.data;
};

const createRefactorPlan = async (analysisId) => {
  const response = await api.post(`/reports/${analysisId}/refactor-plan`);
  return response.data;
};

const updateStepStatus = async (planId, stepId, status) => {
  const response = await api.patch(`/reports/refactor-plan/${planId}/step/${stepId}`, { status });
  return response.data;
};

export default { getReport, createRefactorPlan, updateStepStatus };