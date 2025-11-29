// Cek Login
Auth.requireAuth();

// ========== DOM ELEMENTS ==========
const journalGrid = document.getElementById('journalGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const popupOverlay = document.getElementById('popupOverlay');
const popupClose = document.getElementById('popupClose');
const viewMode = document.getElementById('viewMode');
const editMode = document.getElementById('editMode');
const logoutBtn = document.getElementById('logoutBtn');

// Elements di mode VIEW
const popupEmotionCircle = document.getElementById('popupEmotionCircle');
const popupEmotionText = document.getElementById('popupEmotionText');
const popupDate = document.getElementById('popupDate');
const journalContentDisplay = document.getElementById('journalContentDisplay');
const btnEdit = document.getElementById('btnEdit');
const btnDelete = document.getElementById('btnDelete');

// Elements di mode EDIT
const emotionOptions = document.querySelectorAll('.emotion-option');
const journalTextEdit = document.getElementById('journalTextEdit');
const btnCancel = document.getElementById('btnCancel');
const btnSave = document.getElementById('btnSave');

// ========== STATE ==========
let allJournals = [];
let currentJournal = null;
let selectedMoodId = null;

// Mapping ID mood (Sama dengan mainpage.js)
const moodMap = {
    1: { name: 'senang', color: '#F7D046' },
    2: { name: 'sedih', color: '#2E5DAE' },
    3: { name: 'marah', color: '#D5222A' },
    4: { name: 'takut', color: '#A282C4' },
    5: { name: 'frustasi', color: '#E66A2B' }
};

// ========== INIT: LOAD JOURNALS ==========
document.addEventListener('DOMContentLoaded', loadJournals);

async function loadJournals() {
    try {
        showLoading();
        
        const result = await API.getAllJournals();
        
        if (result.success) {
            allJournals = result.data;
            
            if (allJournals.length === 0) {
                showEmptyState();
            } else {
                hideLoading();
                renderJournals(allJournals);
            }
        } else {
            hideLoading();
            showError('Gagal memuat jurnal');
        }
    } catch (error) {
        console.error('Error loading journals:', error);
        hideLoading();
        showError('Koneksi ke server gagal');
    }
}

// ========== RENDER JOURNALS ==========
function renderJournals(journals) {
    journalGrid.innerHTML = '';
    
    if (journals.length === 0) {
        journalGrid.innerHTML = '<div class="empty-state"><i class="fa-regular fa-face-sad-tear"></i><p>Tidak ada jurnal yang cocok</p></div>';
        return;
    }
    
    journals.forEach(journal => {
        const card = createJournalCard(journal);
        journalGrid.appendChild(card);
    });
}

function createJournalCard(journal) {
    const card = document.createElement('div');
    card.className = 'journal-card';
    card.style.borderLeftColor = journal.mood_color;
    
    const date = new Date(journal.created_at);
    const formattedDate = date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
    });
    
    // Potong konten jika terlalu panjang
    const preview = journal.content.length > 120 
        ? journal.content.substring(0, 120) + '...' 
        : journal.content;
    
    card.innerHTML = `
        <div class="journal-card-header">
            <div class="journal-mood">
                <span class="mood-circle" style="background: ${journal.mood_color}"></span>
                <span class="mood-name">${journal.mood_name}</span>
            </div>
            <span class="journal-date">${formattedDate}</span>
        </div>
        <p class="journal-preview">${preview}</p>
    `;
    
    card.addEventListener('click', () => openJournalPopup(journal));
    
    return card;
}

// ========== FILTER ==========
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Toggle active state
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        let filtered = allJournals;
        
        if (filter !== 'all') {
            filtered = filtered.filter(j => j.mood_name.toLowerCase() === filter);
        }
        
        renderJournals(filtered);
    });
});

// ========== POPUP FUNCTIONS ==========
function openJournalPopup(journal) {
    currentJournal = journal;
    selectedMoodId = journal.mood_id;
    
    // Set data ke popup
    popupEmotionCircle.style.backgroundColor = journal.mood_color;
    popupEmotionText.textContent = journal.mood_name;
    
    const date = new Date(journal.created_at);
    popupDate.textContent = date.toLocaleDateString('id-ID', { 
        weekday: 'long',
        day: 'numeric', 
        month: 'long', 
        year: 'numeric'
    });
    
    journalContentDisplay.textContent = journal.content;
    
    // Show VIEW mode
    viewMode.style.display = 'block';
    editMode.style.display = 'none';
    
    popupOverlay.classList.add('active');
}

function closePopup() {
    popupOverlay.classList.remove('active');
    currentJournal = null;
    selectedMoodId = null;
    
    // Reset emotion selection
    emotionOptions.forEach(opt => opt.classList.remove('selected'));
}

// ========== EDIT MODE ==========
btnEdit.addEventListener('click', () => {
    // Switch ke mode EDIT
    viewMode.style.display = 'none';
    editMode.style.display = 'block';
    
    // Isi textarea dengan konten saat ini
    journalTextEdit.value = currentJournal.content;
    
    // Pre-select mood yang sekarang
    emotionOptions.forEach(opt => {
        if (parseInt(opt.dataset.moodId) === currentJournal.mood_id) {
            opt.classList.add('selected');
        }
    });
});

// Select emotion baru
emotionOptions.forEach(opt => {
    opt.addEventListener('click', () => {
        emotionOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedMoodId = parseInt(opt.dataset.moodId);
    });
});

// ========== CANCEL EDIT ==========
btnCancel.addEventListener('click', () => {
    // Kembali ke mode VIEW
    viewMode.style.display = 'block';
    editMode.style.display = 'none';
    
    // Reset selection
    selectedMoodId = currentJournal.mood_id;
    emotionOptions.forEach(opt => opt.classList.remove('selected'));
});

// ========== UPDATE JOURNAL ==========
btnSave.addEventListener('click', async () => {
    const newContent = journalTextEdit.value.trim();
    
    if (!newContent) {
        alert('Isi jurnal tidak boleh kosong!');
        return;
    }
    
    if (!selectedMoodId) {
        alert('Pilih emosi terlebih dahulu!');
        return;
    }
    
    const originalText = btnSave.innerHTML;
    btnSave.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
    btnSave.disabled = true;
    
    try {
        const result = await API.updateJournal(currentJournal.id, {
            mood_id: selectedMoodId,
            content: newContent
        });
        
        if (result.success) {
            // Update butiran rasa di mainpage (warna bola)
            await API.updateButiranMood(currentJournal.id, selectedMoodId);
            
            // Refresh data
            await loadJournals();
            
            closePopup();
            showSuccess('Jurnal berhasil diperbarui!');
        } else {
            throw new Error(result.message || 'Gagal memperbarui jurnal');
        }
    } catch (error) {
        console.error('Error updating journal:', error);
        alert(error.message);
    } finally {
        btnSave.innerHTML = originalText;
        btnSave.disabled = false;
    }
});

// ========== DELETE JOURNAL ==========
btnDelete.addEventListener('click', async () => {
    if (!confirm('Apakah kamu yakin ingin menghapus jurnal ini? Tindakan ini tidak dapat dibatalkan.')) {
        return;
    }
    
    const originalText = btnDelete.innerHTML;
    btnDelete.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menghapus...';
    btnDelete.disabled = true;
    
    try {
        const result = await API.deleteJournal(currentJournal.id);
        
        if (result.success) {
            // Hapus juga butiran rasa di mainpage
            await API.deleteButiranByJournal(currentJournal.id);
            
            // Refresh data
            await loadJournals();
            
            closePopup();
            showSuccess('Jurnal berhasil dihapus!');
        } else {
            throw new Error(result.message || 'Gagal menghapus jurnal');
        }
    } catch (error) {
        console.error('Error deleting journal:', error);
        alert(error.message);
    } finally {
        btnDelete.innerHTML = originalText;
        btnDelete.disabled = false;
    }
});

// ========== UI HELPERS ==========
function showLoading() {
    journalGrid.innerHTML = '<div class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i><p>Memuat jurnal...</p></div>';
}

function hideLoading() {
    const loadingState = journalGrid.querySelector('.loading-state');
    if (loadingState) loadingState.remove();
}

function showEmptyState() {
    journalGrid.innerHTML = '<div class="empty-state"><i class="fa-regular fa-face-sad-tear"></i><p>Belum ada jurnal yang tersimpan</p></div>';
}

function showError(message) {
    journalGrid.innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><p>${message}</p></div>`;
}

function showSuccess(message) {
    // Simple notification (bisa dipercantik)
    const notif = document.createElement('div');
    notif.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #28a745; color: white; padding: 15px 25px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 9999; font-family: Montserrat; font-weight: 600;';
    notif.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${message}`;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'fadeOut 0.3s';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// ========== CLOSE POPUP ==========
popupClose.addEventListener('click', closePopup);
popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) closePopup();
});

// ========== LOGOUT ==========
logoutBtn.addEventListener('click', () => {
    if (confirm('Yakin ingin logout?')) Auth.logout();
});