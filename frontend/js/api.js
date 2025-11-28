// Base URL API
const API_URL = 'http://localhost:3000/api';

// Helper: Ambil Token dari LocalStorage
const getToken = () => localStorage.getItem('token');

// Helper: Simpan User ke LocalStorage
const saveUser = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
};

// Helper: Handle Respon API agar tidak Crash
const handleResponse = async (response) => {
    try {
        const contentType = response.headers.get("content-type");
        
        // 1. Jika respon sukses & JSON
        if (response.ok && contentType && contentType.includes("application/json")) {
            return await response.json();
        }
        
        // 2. Jika respon error tapi JSON (misal: 400 Bad Request)
        if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            return { success: false, message: errorData.message || 'Terjadi kesalahan pada server' };
        }

        // 3. Jika respon bukan JSON (misal: 404 Not Found HTML atau 500 Internal Server Error)
        const text = await response.text();
        console.error("Respon Non-JSON:", text);
        return { success: false, message: `Server Error (${response.status}): ${response.statusText}` };

    } catch (error) {
        console.error("Gagal parsing respon:", error);
        return { success: false, message: 'Gagal memproses data dari server' };
    }
};

// --- SERVICE API ---
const API = {
  // 1. REGISTER
  register: async (name, username, password) => {
    try {
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, username, password })
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("Fetch Error:", error);
        return { success: false, message: 'Koneksi ke server gagal (Cek terminal backend)' };
    }
  },

  // 2. LOGIN
  login: async (username, password) => {
    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("Fetch Error:", error);
        return { success: false, message: 'Koneksi ke server gagal (Cek terminal backend)' };
    }
  },

  // 3. GET PROFILE
  getProfile: async () => {
    const token = getToken();
    if (!token) return { success: false, message: 'Token tidak ditemukan (Silakan Login)' };

    try {
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("Fetch Error:", error);
        return { success: false, message: 'Koneksi terputus' };
    }
  },

  // 4. UPDATE PROFILE
  updateProfile: async (name, username) => {
    const token = getToken();
    try {
        const response = await fetch(`${API_URL}/users/update-profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, username })
        });
        return await handleResponse(response);
    } catch (error) {
        return { success: false, message: 'Gagal menghubungi server' };
    }
  },

  // 5. CHANGE PASSWORD
  changePassword: async (currentPassword, newPassword) => {
    const token = getToken();
    try {
        const response = await fetch(`${API_URL}/users/change-password`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        return await handleResponse(response);
    } catch (error) {
        return { success: false, message: 'Gagal menghubungi server' };
    }
  },

  // 6. DELETE ACCOUNT
  deleteAccount: async () => {
    const token = getToken();
    try {
        const response = await fetch(`${API_URL}/users/account`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return await handleResponse(response);
    } catch (error) {
        return { success: false, message: 'Gagal menghubungi server' };
    }
  }
};

// --- AUTH HELPER ---
const Auth = {
  isLoggedIn: () => !!getToken(),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  },

  requireAuth: () => {
    if (!getToken()) {
        window.location.href = 'login.html';
    }
  }
};