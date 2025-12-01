import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const readToken = () => {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("demo_jwt") || "";
};

apiClient.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = async (payload) => {
  const { data } = await apiClient.post("/users/register", payload);
  return data;
};

export const loginUser = async (payload) => {
  const { data } = await apiClient.post("/users/login", payload);
  return data;
};

export const fetchGoals = async () => {
  const { data } = await apiClient.get("/goals");
  return data;
};

export const createGoal = async (goal) => {
  const { data } = await apiClient.post("/goals", goal);
  return data;
};

export const fetchGoalProgress = async (goalId) => {
  const { data } = await apiClient.get(`/goals/${goalId}/progress`);
  return data;
};

export const generateAiChallenge = async (payload = {}) => {
  const { data } = await apiClient.post("/ai/generateChallenge", payload);
  return data;
};

export const fetchChallenges = async (params = {}) => {
  const { data } = await apiClient.get("/challenges", { params });
  return data;
};

export const createChallenge = async (challenge) => {
  const { data } = await apiClient.post("/challenges", challenge);
  return data;
};

export const updateChallenge = async (challengeId, updates) => {
  const { data } = await apiClient.patch(`/challenges/${challengeId}`, updates);
  return data;
};

export const submitForFeedback = async (payload) => {
  const { data } = await apiClient.post("/ai/submitForFeedback", payload);
  return data;
};

export const deleteChallenge = async (challengeId) => {
  await apiClient.delete(`/challenges/${challengeId}`);
};

export default apiClient;
