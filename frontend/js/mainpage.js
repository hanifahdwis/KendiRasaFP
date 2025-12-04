
if (typeof Auth !== 'undefined') {
    Auth.requireAuth();
}

const ballContainer = document.getElementById('ballContainer');
const popupOverlay = document.getElementById('popupOverlay');
const popupEmotionCircle = document.getElementById('popupEmotionCircle');
const popupEmotionText = document.getElementById('popupEmotionText');
const journalText = document.getElementById('journalText');
const btnSimpan = document.getElementById('btnSimpan');
const emotionSection = document.querySelector('.emotion-section');
const logoutBtn = document.getElementById('logoutBtn');
const profileIconSidebar = document.querySelector('.profile-icon-sidebar');

let currentSelection = null;
let allMoods = []; 

document.addEventListener('DOMContentLoaded', async () => {
    await loadAllMoods();
    await loadBalls(); 
});

async function loadAllMoods() {
    try {
        const result = await API.getAllCustomMoods();
        
        if (result.success) {
            allMoods = result.data;
            renderEmotionButtons(allMoods);
        }
    } catch (error) {
        console.error("Gagal load moods:", error);
    }
}

function renderEmotionButtons(moods) {
    emotionSection.innerHTML = '';
    
    moods.forEach(mood => {
        const btn = document.createElement('button');
        btn.className = 'emotion-btn';
        btn.dataset.moodId = mood.id;
        btn.dataset.emotion = mood.name.toLowerCase();
        btn.dataset.color = mood.color;
        
        btn.innerHTML = `
            <span class="emotion-circle" style="background: ${mood.color};"></span>
            <span class="emotion-label">${mood.name.toLowerCase()}</span>
        `;
        
        btn.addEventListener('click', () => {
            currentSelection = { 
                mood_id: mood.id,
                name: mood.name.toLowerCase(),
                color: mood.color
            };
            
            openPopup(currentSelection, false);
        });
        
        emotionSection.appendChild(btn);
    });
}
async function loadBalls() {
    try {
        const result = await API.getAllButiran();
        
        if (result.success) {
            result.data.forEach(item => renderBall(item));
        }
    } catch (error) {
        console.error("Gagal load data:", error);
    }
}

btnSimpan.addEventListener('click', async () => {
    if (btnSimpan.textContent === 'tutup') {
        closePopup();
        return;
    }

    const content = journalText.value.trim();
    if (!content) {
        alert("Isi jurnal dulu ya! 😊");
        return;
    }

    const originalText = btnSimpan.textContent;
    btnSimpan.textContent = 'Menyimpan...';
    btnSimpan.disabled = true;

    try {
        const resJournal = await API.createJournal({
            mood_id: currentSelection.mood_id,
            content: content
        });

        if (resJournal.success) {
            const newJournalId = resJournal.data.id;
            const resBall = await API.createButiran(newJournalId, currentSelection.mood_id);

            if (resBall.success) {
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
        btnSimpan.textContent = originalText;
        btnSimpan.disabled = false;
    }
});

//RENDER BALL
function renderBall(data) {
    const ball = document.createElement('div');
    ball.className = 'ball';
    ball.style.backgroundColor = data.mood_color || data.color; 
    
    ball.dataset.journalId = data.journal_id;
    ball.dataset.content = data.journal_preview || data.journal_content || "Memuat...";
    ball.dataset.moodName = data.mood_name;
    ball.dataset.color = data.mood_color || data.color;

    ballContainer.appendChild(ball);
}

function openPopup(data, isReadOnly) {
    popupEmotionCircle.style.backgroundColor = data.color;
    popupEmotionText.textContent = data.name;
    
    journalText.value = isReadOnly ? data.content : '';
    journalText.readOnly = isReadOnly;
    
    btnSimpan.textContent = isReadOnly ? 'tutup' : 'simpan';
    
    popupOverlay.classList.add('active');
}

function closePopup() {
    popupOverlay.classList.remove('active');
    currentSelection = null;
}

popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) closePopup();
});
logoutBtn.addEventListener('click', () => {
    if(confirm("Yakin ingin logout?")) Auth.logout();
});

profileIconSidebar.addEventListener('click', () => {
    window.location.href = 'profile.html';
});