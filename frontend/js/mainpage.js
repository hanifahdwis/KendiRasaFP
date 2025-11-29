// frontend/js/main.js

// 1. Cek Login (Pastikan api.js sudah dimuat di HTML sebelum file ini)
if (typeof Auth !== 'undefined') {
    Auth.requireAuth();
}

// 2. DOM ELEMENTS
const ballContainer = document.getElementById('ballContainer');
const popupOverlay = document.getElementById('popupOverlay');
const popupEmotionCircle = document.getElementById('popupEmotionCircle');
const popupEmotionText = document.getElementById('popupEmotionText');
const journalText = document.getElementById('journalText');
const btnSimpan = document.getElementById('btnSimpan');
const emotionButtons = document.querySelectorAll('.emotion-btn');
const logoutBtn = document.getElementById('logoutBtn');
const profileIconSidebar = document.querySelector('.profile-icon-sidebar');

let currentSelection = null; 

// 3. MAPPING ID MOOD (Sesuai urutan di Database Backend)
// Pastikan urutan ini sama dengan yang ada di database.js
const moodMap = {
    'senang': 1,
    'sedih': 2,
    'marah': 3,
    'takut': 4,
    'frustasi': 5
};

// 4. INIT: Load Data Bola dari Database saat halaman dibuka
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Panggil API Backend buat minta data bola
        const result = await API.getAllButiran();
        
        if (result.success) {
            // Kalau sukses, gambar setiap bola satu per satu
            result.data.forEach(item => renderBall(item));
        }
    } catch (error) {
        console.error("Gagal load data:", error);
    }
});

// 5. KLIK TOMBOL RASA -> Buka Popup
emotionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const emotionName = btn.dataset.emotion; 
        const color = btn.dataset.color;
        
        // Simpan mood yang dipilih user
        currentSelection = { 
            mood_id: moodMap[emotionName], 
            name: emotionName,
            color: color 
        };
        
        openPopup(currentSelection, false); // false = Mode Nulis (Bukan Baca)
    });
});

// 6. KLIK SIMPAN -> Kirim ke Backend
btnSimpan.addEventListener('click', async () => {
    // Kalau tombolnya lagi jadi tombol "Tutup" (Mode Baca), tutup aja popupnya
    if (btnSimpan.textContent === 'tutup') {
        closePopup();
        return;
    }

    const content = journalText.value.trim();
    if (!content) {
        alert("Isi jurnal dulu ya! 😊");
        return;
    }

    // Ubah tombol jadi loading biar user tau lagi proses
    const originalText = btnSimpan.textContent;
    btnSimpan.textContent = 'Menyimpan...';
    btnSimpan.disabled = true;

    try {
        // STEP A: Simpan Isi Jurnal ke API Temenmu
        const resJournal = await API.createJournal({
            mood_id: currentSelection.mood_id,
            content: content
        });

        if (resJournal.success) {
            const newJournalId = resJournal.data.id; // Dapet ID jurnal baru

            // STEP B: Bikin Bola Visual ke API Kamu
            const resBall = await API.createButiran(newJournalId, currentSelection.mood_id);

            if (resBall.success) {
                // STEP C: Render Bola Baru di Layar (Tanpa Refresh Halaman)
                const newBallData = {
                    ...resBall.data,
                    mood_color: currentSelection.color,
                    mood_name: currentSelection.name,
                    journal_preview: content
                };
                
                renderBall(newBallData);
                closePopup();
            } else {
                alert("Gagal membuat visualisasi butiran.");
            }
        } else {
            alert("Gagal menyimpan jurnal.");
        }

    } catch (error) {
        console.error(error);
        alert("Terjadi kesalahan koneksi.");
    } finally {
        // Balikin tombol ke semula
        btnSimpan.textContent = originalText;
        btnSimpan.disabled = false;
    }
});

// 7. FUNGSI RENDER BOLA (Logic Tumpukan Flexbox)
function renderBall(data) {
    const ball = document.createElement('div');
    ball.className = 'ball';
    ball.style.backgroundColor = data.mood_color || data.color; 
    
    // POSISI: Tidak perlu set style.left/top lagi karena pakai CSS Flexbox
    
    // SIMPAN DATA: Taruh data jurnal di elemen bola biar pas diklik bisa dibaca
    ball.dataset.journalId = data.journal_id;
    ball.dataset.content = data.journal_preview || data.journal_content || "Memuat...";
    ball.dataset.moodName = data.mood_name;
    ball.dataset.color = data.mood_color || data.color;

    ballContainer.appendChild(ball);
}

// 8. HELPER POPUP
function openPopup(data, isReadOnly) {
    popupEmotionCircle.style.backgroundColor = data.color;
    popupEmotionText.textContent = data.name;
    
    journalText.value = isReadOnly ? data.content : '';
    journalText.readOnly = isReadOnly; // Kunci textarea kalau mode baca
    
    // Ganti tulisan tombol
    btnSimpan.textContent = isReadOnly ? 'tutup' : 'simpan';
    
    popupOverlay.classList.add('active');
}

function closePopup() {
    popupOverlay.classList.remove('active');
    currentSelection = null;
}

// Tutup popup kalau klik area gelap di luar
popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) closePopup();
});

// 9. NAVIGASI LAINNYA
logoutBtn.addEventListener('click', () => {
    if(confirm("Yakin ingin logout?")) Auth.logout();
});

profileIconSidebar.addEventListener('click', () => {
    window.location.href = 'profile.html';
});