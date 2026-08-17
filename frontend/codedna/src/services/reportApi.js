import api from "./api.js";

const getReport = async (analysisId) => {
  const response = await api.get(`/reports/${analysisId}`);
  return response.data;
};

export default { getReport };