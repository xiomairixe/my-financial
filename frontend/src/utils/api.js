import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export const getSummary = () => api.get('/summary');
export const getMonthlySummary = () => api.get('/summary/monthly');
export const getCategorySummary = () => api.get('/summary/categories');

export const getTransactions = (params) => api.get('/transactions', { params });
export const createTransaction = (data) => api.post('/transactions', data);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);

export const getBudgets = (month, year) => api.get('/budgets', { params: { month, year } });
export const createBudget = (data) => api.post('/budgets', data);
export const deleteBudget = (id) => api.delete(`/budgets/${id}`);

export const getCategories = () => api.get('/categories');
export const createCategory = (data) => api.post('/categories', data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

export const getSavingsGoals = () => api.get('/savings');
export const createSavingsGoal = (data) => api.post('/savings', data);
export const updateSavingsGoal = (id, data) => api.patch(`/savings/${id}`, data);
export const deleteSavingsGoal = (id) => api.delete(`/savings/${id}`);

export const getReports = (months) => api.get('/reports', { params: { months } });

export default api;