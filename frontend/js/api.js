
const API_URL = 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('token');

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

const API = {
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

    createJournal: async (data) => {
        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/journals`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data) 
            });
            return await handleResponse(response);
        } catch (e) { return { success: false, message: 'Koneksi error' }; }
    },

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

    updateJournal: async (id, data) => {
        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/journals/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data) 
            });
            return await handleResponse(response);
        } catch (e) { return { success: false, message: 'Koneksi error' }; }
    },

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

