// frontend/js/api.js - UPDATED VERSION

// Base URL API
const API_URL = 'http://localhost:3000/api';

// Helper: Ambil Token dari LocalStorage
const getToken = () => localStorage.getItem('token');

// Helper: Handle Respon API
const handleResponse = async (response) => {
    try {
        const contentType = response.headers.get("content-type");
        if (response.ok && contentType && contentType.includes("application/json")) {
            return await response.json();
        }
        if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            return { success: false, message: errorData.message || 'Terjadi kesalahan pada server' };
        }
        const text = await response.text();
        return { success: false, message: `Server Error (${response.status})` };
    } catch (error) {
        console.error("Gagal parsing respon:", error);
        return { success: false, message: 'Gagal memproses data dari server' };
    }
};

// --- SERVICE API ---
const API = {
    // ========== 1. AUTH & USER ==========
    register: async (name, username, password) => {
        try {
            const response = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username, password })
            });
            return await handleResponse(response);
        } catch (e) { return { success: false, message: 'Koneksi error' }; }
    },

    login: async (username, password) => {
        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            return await handleResponse(response);
        } catch (e) { return { success: false, message: 'Koneksi error' }; }
    },

    getProfile: async () => {
        const token = getToken();
        if (!token) return { success: false, message: 'No token' };
        try {
            const response = await fetch(`${API_URL}/users/profile`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await handleResponse(response);
        } catch (e) { return { success: false, message: 'Koneksi error' }; }
    },

    updateProfile: async (name, username) => {
        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/users/update-profile`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username })
            });
            return await handleResponse(response);
        } catch (e) { return { success: false, message: 'Koneksi error' }; }
    },

    changePassword: async (currentPassword, newPassword) => {
        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/users/change-password`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            return await handleResponse(response);
        } catch (e) { return { success: false, message: 'Koneksi error' }; }
    },

    deleteAccount: async () => {
        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/users/account`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await handleResponse(response);
        } catch (e) { return { success: false, message: 'Koneksi error' }; }
    },

    // ========== 2. JURNAL (CREATE, READ, UPDATE, DELETE) ==========

    // CREATE: Buat jurnal baru
    createJournal: async (data) => {
        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/journals`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data) // { mood_id, content }
            });
            return await handleResponse(response);
        } catch (e) { return { success: false, message: 'Koneksi error' }; }
    },

    // READ: Ambil semua jurnal user
    getAllJournals: async () => {
        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/journals`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await handleResponse(response);
        } catch (e) { return { success: false, message: 'Koneksi error' }; }
    },

    // READ: Ambil 1 jurnal by ID
    getJournalById: async (id) => {
        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/journals/${id}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await handleResponse(response);
        } catch (e) { return { success: false, message: 'Koneksi error' }; }
    },

    // UPDATE: Edit jurnal
    updateJournal: async (id, data) => {
        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/journals/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data) // { mood_id, content }
            });
            return await handleResponse(response);
        } catch (e) { return { success: false, message: 'Koneksi error' }; }
    },

    // DELETE: Hapus jurnal
    deleteJournal: async (id) => {
        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/journals/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await handleResponse(response);
        } catch (e) { return { success: false, message: 'Koneksi error' }; }
    },

    // ========== 3. KENDI RASA (BUTIRAN) ==========

    // CREATE: Buat butiran baru
    createButiran: async (journalId, moodId) => {
        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/kendi-rasa`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ journal_id: journalId, mood_id: moodId })
            });
            return await handleResponse(response);
        } catch (e) { return { success: false, message: 'Koneksi error' }; }
    },

    // READ: Ambil semua butiran user
    getAllButiran: async () => {
        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/kendi-rasa`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await handleResponse(response);
        } catch (e) { return { success: false, message: 'Koneksi error' }; }
    },

    // UPDATE: Ubah warna butiran (mood_id)
    updateButiranMood: async (journalId, newMoodId) => {
        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/kendi-rasa/mood`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ journal_id: journalId, mood_id: newMoodId })
            });
            return await handleResponse(response);
        } catch (e) { return { success: false, message: 'Koneksi error' }; }
    },

    // DELETE: Hapus butiran by journal_id
    deleteButiranByJournal: async (journalId) => {
        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/kendi-rasa/journal/${journalId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await handleResponse(response);
        } catch (e) { return { success: false, message: 'Koneksi error' }; }
    },

    // ========== 4. CUSTOM MOODS (KELOLA RASA) ==========

// CREATE: Tambah rasa baru
createCustomMood: async (name, color) => {
        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/custom-moods`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, color })
            });
            return await handleResponse(response);
        } catch (e) { return { success: false, message: 'Koneksi error' }; }
    },

    // READ: Ambil semua rasa
    getAllCustomMoods: async () => {
        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/custom-moods`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await handleResponse(response);
        } catch (e) { return { success: false, message: 'Koneksi error' }; }
    },

    // UPDATE: Edit rasa
    updateCustomMood: async (id, name, color) => {
        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/custom-moods/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, color })
            });
            return await handleResponse(response);
        } catch (e) { return { success: false, message: 'Koneksi error' }; }
    },

    // DELETE: Hapus rasa
    deleteCustomMood: async (id) => {
        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/custom-moods/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await handleResponse(response);
        } catch (e) { return { success: false, message: 'Koneksi error' }; }
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

