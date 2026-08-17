import api from "./api.js";

const startAnalysis = async (repoId) => {
  const response = await api.post(`/analysis/${repoId}/start`);
  return response.data;
};

const getAnalysis = async (analysisId) => {
  const response = await api.get(`/analysis/${analysisId}`);
  return response.data;
};

export default { startAnalysis, getAnalysis };