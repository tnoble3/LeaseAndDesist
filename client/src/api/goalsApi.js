import api from './axios';

export const fetchGoals = () => api.get('/goals');
export const createGoal = (data) => api.post('/goals', data);
export const updateGoal = (id, data) => api.put(`/goals/${id}`, data);
export const deleteGoal = (id) => api.delete(`/goals/${id}`);

export const createChallenge = (data) => api.post('/challenges', data);
export const fetchChallengesForGoal = (goalId) => api.get(`/challenges/goal/${goalId}`);
export const updateChallenge = (id, data) => api.put(`/challenges/${id}`, data);
export const deleteChallenge = (id) => api.delete(`/challenges/${id}`);
