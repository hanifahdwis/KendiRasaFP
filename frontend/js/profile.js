// Cek Login
Auth.requireAuth();

// Elemen DOM
const displayName = document.getElementById('displayName');
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const joinedInput = document.getElementById('joinedInput');
const editBtn = document.getElementById('editBtn');
const saveBtn = document.getElementById('saveBtn');
const togglePasswordBtn = document.getElementById('togglePassword');
const logoutBtn = document.getElementById('logoutBtn');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');

let isEditing = false;

// --- 1. READ: Load Data Profil (DIPERBAIKI) ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const result = await API.getProfile();
        
        // Cek sukses atau gagal
        if (result.success) {
            const user = result.data.user;
            
            // Isi Data ke Tampilan
            displayName.innerText = user.name;
            usernameInput.value = user.username;
            
            // Default Password
            passwordInput.value = "xxxxxxxx"; 
            passwordInput.type = "password"; 

            // Format Tanggal
            const date = new Date(user.created_at);
            joinedInput.value = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        } else {
            // JIKA GAGAL (Token expired atau error lain)
            console.error("Gagal load profil:", result.message);
            displayName.innerText = "Gagal memuat data";
            displayName.style.color = "red";
            displayName.style.fontSize = "1.5rem";
            
            // Opsional: Redirect ke login jika session habis
            if(result.message.includes("token")) {
                alert("Sesi habis, silakan login ulang.");
                Auth.logout();
            }
        }
    } catch (error) {
        // JIKA SERVER MATI / KONEKSI PUTUS
        console.error("Error koneksi:", error);
        displayName.innerText = "Koneksi ke Server Gagal";
        displayName.style.color = "red";
    }
});

// --- 2. EDIT MODE TOGGLE ---
editBtn.addEventListener('click', () => {
    isEditing = true;
    editBtn.style.display = 'none';
    saveBtn.style.display = 'inline-flex';
    togglePasswordBtn.style.display = 'block';

    usernameInput.disabled = false;
    passwordInput.disabled = false;
    
    // Jangan hapus isi, biarkan placeholder handle text
    passwordInput.setAttribute("placeholder", "Ketik password baru untuk mengubah");
    
    usernameInput.focus();
    usernameInput.style.backgroundColor = "rgba(255,255,255,0.8)"; 
    passwordInput.style.backgroundColor = "rgba(255,255,255,0.8)"; 
});

// --- 3. TOGGLE PASSWORD ---
togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    if (type === 'password') {
        togglePasswordBtn.className = 'fa-regular fa-eye password-toggle';
    } else {
        togglePasswordBtn.className = 'fa-regular fa-eye-slash password-toggle';
    }
});

// --- 4. UPDATE: Simpan Perubahan ---
saveBtn.addEventListener('click', async () => {
    const newUsername = usernameInput.value;
    const newPassword = passwordInput.value;
    const currentName = displayName.innerText; 

    // Tombol jadi loading agar user tahu sedang proses
    const originalBtnText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
    saveBtn.disabled = true;

    try {
        // A. Update Profil
        const updateResult = await API.updateProfile(currentName, newUsername);
        if (!updateResult.success) {
            alert('Gagal update profil: ' + updateResult.message);
            resetBtn();
            return;
        }

        // B. Update Password
        if (newPassword !== "xxxxxxxx" && newPassword.trim() !== "") {
            const currentPass = prompt("Masukkan password LAMA untuk konfirmasi:");
            
            if (currentPass) {
                const passResult = await API.changePassword(currentPass, newPassword);
                if (!passResult.success) {
                    alert('Gagal ganti password: ' + passResult.message);
                    resetBtn();
                    return;
                } else {
                    alert('Password berhasil diperbarui!');
                }
            } else {
                alert('Perubahan password dibatalkan.');
            }
        } else {
            alert('Profil berhasil diperbarui!');
        }

        // Refresh halaman
        location.reload();

    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan koneksi ke server.');
        resetBtn();
    }

    function resetBtn() {
        saveBtn.innerHTML = originalBtnText;
        saveBtn.disabled = false;
    }
});

// --- 5. DELETE AKUN ---
deleteAccountBtn.addEventListener('click', async () => {
    if(confirm("Yakin hapus akun? Data hilang permanen.")) {
        const res = await API.deleteAccount();
        if(res.success) Auth.logout();
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    if(confirm("Keluar?")) Auth.logout();
});