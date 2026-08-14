import axios from "axios";
import { env } from "../config/env.js";

const client = axios.create({
  baseURL: env.aiServiceUrl,
  timeout: 120000,
});

export const parseRepository = async (payload) => {
  const response = await client.post("/parse", payload);
  return response.data;
};

export const predictRisk = async (payload) => {
  const response = await client.post("/predict", payload);
  return response.data;
};

export const computeFuzzyScore = async (payload) => {
  const response = await client.post("/fuzzy", payload);
  return response.data;
};

export const generateRefactorPlan = async (payload) => {
  const response = await client.post("/genetic", payload);
  return response.data;
};

export const explainPredictions = async (payload) => {
  const response = await client.post("/explain", payload);
  return response.data;
};

export const generateDocumentation = async (payload) => {
  const response = await client.post("/llm", payload);
  return response.data;
};