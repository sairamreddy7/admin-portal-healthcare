import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  },

  getCurrentUser() {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
  },

  getToken() {
    return localStorage.getItem('adminToken');
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};
