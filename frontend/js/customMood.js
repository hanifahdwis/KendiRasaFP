Auth.requireAuth();

const moodsContainer = document.getElementById('moodsContainer');
const emptyState = document.getElementById('emptyState');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalTitle = document.getElementById('modalTitle');
const moodForm = document.getElementById('moodForm');
const moodName = document.getElementById('moodName');
const colorCode = document.getElementById('colorCode');
const btnCancel = document.getElementById('btnCancel');
const btnSave = document.getElementById('btnSave');
const presetColors = document.querySelectorAll('.preset-color');
const logoutBtn = document.getElementById('logoutBtn');
const deleteSection = document.getElementById('deleteSection');
const btnDeleteModal = document.getElementById('btnDeleteModal');

let allMoods = [];
let editingMoodId = null;
let editingMoodName = null;

document.addEventListener('DOMContentLoaded', loadMoods);

async function loadMoods() {
    try {
        showLoading();
        
        const result = await API.getAllCustomMoods();
        
        if (result.success) {
            allMoods = result.data;
            hideLoading();
            
            if (allMoods.length === 0) {
                emptyState.style.display = 'flex';
            } else {
                emptyState.style.display = 'none';
                renderMoods(allMoods);
            }
        } else {
            hideLoading();
        }
    } catch (error) {
        console.error('Error loading moods:', error);
        hideLoading();
    }
}

function renderMoods(moods) {
    moodsContainer.innerHTML = '';
    
    moods.forEach(mood => {
        const moodBtn = document.createElement('button');
        moodBtn.className = `mood-pill ${mood.is_default ? 'default' : 'custom'}`;
        moodBtn.style.background = mood.color;
        moodBtn.textContent = mood.name;
        
        if (!mood.is_default) {
            moodBtn.addEventListener('click', () => openEditModal(mood));
        }
        
        moodsContainer.appendChild(moodBtn);
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'btn-add-mood-pill';
    addBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
    addBtn.addEventListener('click', openAddModal);
    moodsContainer.appendChild(addBtn);
}

function openAddModal() {
    editingMoodId = null;
    editingMoodName = null;
    modalTitle.textContent = 'Tambah Rasa Baru';
    moodForm.reset();
    colorCode.value = '';
    deleteSection.style.display = 'none';
    openModal();
}

function openEditModal(mood) {
    editingMoodId = mood.id;
    editingMoodName = mood.name;
    modalTitle.textContent = 'Edit Rasa';
    moodName.value = mood.name;
    colorCode.value = mood.color;
    deleteSection.style.display = 'block';
    openModal();
}

function openModal() {
    modalOverlay.classList.add('active');
}

function closeModal() {
    modalOverlay.classList.remove('active');
    moodForm.reset();
    editingMoodId = null;
    editingMoodName = null;
    deleteSection.style.display = 'none';
}

modalClose.addEventListener('click', closeModal);
btnCancel.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

colorCode.addEventListener('input', (e) => {
    let value = e.target.value;
    
    if (!value.startsWith('#')) {
        value = '#' + value;
    }
    
    if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
        e.target.value = value.toUpperCase();
    } else {
        e.target.value = e.target.value.slice(0, -1);
    }
});

presetColors.forEach(btn => {
    btn.addEventListener('click', () => {
        const color = btn.dataset.color;
        colorCode.value = color;
        
        presetColors.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    });
});

moodForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = moodName.value.trim();
    const color = colorCode.value;
    
    if (!name || name.length < 2) {
        return;
    }
    
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
        return;
    }
    
    const originalText = btnSave.innerHTML;
    btnSave.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
    btnSave.disabled = true;
    
    try {
        let result;
        
        if (editingMoodId) {
            result = await API.updateCustomMood(editingMoodId, name, color);
        } else {
            result = await API.createCustomMood(name, color);
        }
        
        if (result.success) {
            closeModal();
            await loadMoods();
        }
    } catch (error) {
        console.error('Error saving mood:', error);
    } finally {
        btnSave.innerHTML = originalText;
        btnSave.disabled = false;
    }
});

btnDeleteModal.addEventListener('click', async () => {
    if (!editingMoodId) return;
    
    try {
        const result = await API.deleteCustomMood(editingMoodId);
        
        if (result.success) {
            closeModal();
            await loadMoods();
        }
    } catch (error) {
        console.error('Error deleting mood:', error);
    }
});

function showLoading() {
    moodsContainer.innerHTML = '<div class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i><p>Memuat data rasa...</p></div>';
}

function hideLoading() {
    const loadingState = moodsContainer.querySelector('.loading-state');
    if (loadingState) loadingState.remove();
}

logoutBtn.addEventListener('click', () => {
    if (confirm('Yakin ingin logout?')) Auth.logout();
});