// Base URL API
const API_URL = 'http://localhost:3000/api';

// Helper function untuk get token
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function untuk get user
const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// API Service
const API = {
  // Auth APIs
  register: async (name, username, password) => {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, username, password })
    });
    return await response.json();
  },

  login: async (username, password) => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    return await response.json();
  },

  // User APIs (Protected)
  getProfile: async () => {
    const token = getToken();
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return await response.json();
  },

  updateProfile: async (name, username) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, username })
    });
    return await response.json();
  },

  changePassword: async (currentPassword, newPassword) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/users/password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return await response.json();
  },

  deleteAccount: async () => {
    const token = getToken();
    const response = await fetch(`${API_URL}/users/account`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return await response.json();
  },

  // Journal APIs (akan dibuat nanti)
  createJournal: async (mood, content, color) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/journals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mood, content, color })
    });
    return await response.json();
  },

  getAllJournals: async () => {
    const token = getToken();
    const response = await fetch(`${API_URL}/journals`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return await response.json();
  },

  updateJournal: async (id, mood, content, color) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/journals/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mood, content, color })
    });
    return await response.json();
  },

  deleteJournal: async (id) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/journals/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return await response.json();
  }
};

// Auth helper functions
const Auth = {
  isLoggedIn: () => {
    return !!getToken();
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  },

  requireAuth: () => {
    if (!Auth.isLoggedIn()) {
      window.location.href = 'login.html';
    }
  }
};