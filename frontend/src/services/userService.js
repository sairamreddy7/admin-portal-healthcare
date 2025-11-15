import api from './api';

export const userService = {
  getAll: () => api.get('/users'),
  getStats: () => api.get('/users/stats'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`)
};

export const doctorService = {
  getAll: () => api.get('/doctors'),
  getStats: () => api.get('/doctors/stats'),
  getById: (id) => api.get(`/doctors/${id}`),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`)
};

export const patientService = {
  getAll: () => api.get('/patients'),
  getStats: () => api.get('/patients/stats'),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`)
};
