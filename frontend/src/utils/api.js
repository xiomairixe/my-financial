import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Auto-attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

// ── Summary ───────────────────────────────────────────────────
export const getSummary         = ()       => api.get('/summary');
export const getMonthlySummary  = ()       => api.get('/summary/monthly');
export const getCategorySummary = ()       => api.get('/summary/categories');

// ── Transactions ──────────────────────────────────────────────
export const getTransactions    = (params) => api.get('/transactions', { params });
export const createTransaction  = (data)   => api.post('/transactions', data);
export const deleteTransaction  = (id)     => api.delete(`/transactions/${id}`);

// ── Budgets ───────────────────────────────────────────────────
export const getBudgets         = (month, year) => api.get('/budgets', { params: { month, year } });
export const createBudget       = (data)        => api.post('/budgets', data);
export const deleteBudget       = (id)          => api.delete(`/budgets/${id}`);

// ── Categories ────────────────────────────────────────────────
export const getCategories      = ()     => api.get('/categories');
export const createCategory     = (data) => api.post('/categories', data);
export const deleteCategory     = (id)   => api.delete(`/categories/${id}`);

// ── Savings ───────────────────────────────────────────────────
export const getSavingsGoals    = ()          => api.get('/savings');
export const createSavingsGoal  = (data)      => api.post('/savings', data);
export const updateSavingsGoal  = (id, data)  => api.patch(`/savings/${id}`, data);
export const deleteSavingsGoal  = (id)        => api.delete(`/savings/${id}`);

// ── Reports ───────────────────────────────────────────────────
export const getReports         = (months) => api.get('/reports', { params: { months } });

// ── Auth ──────────────────────────────────────────────────────
export const loginUser          = (data) => api.post('/auth/login', data);
export const registerUser       = (data) => api.post('/auth/register', data);
export const getMe              = ()     => api.get('/auth/me');

// ── Settings (NEW) ────────────────────────────────────────────
export const updateProfile      = (data) => api.patch('/auth/profile', data);
export const updatePassword     = (data) => api.patch('/auth/password', data);
export const updateCurrency     = (data) => api.patch('/auth/currency', data);
export const exportData         = ()     => api.get('/auth/export', { responseType: 'blob' });
export const deleteAccount      = (data) => api.delete('/auth/account', { data });

export default api;