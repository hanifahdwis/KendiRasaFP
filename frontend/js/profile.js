Auth.requireAuth();

console.log('Profile.js dimuat'); 

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded triggered'); 
    
    const displayName = document.getElementById('displayName');
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    const joinedInput = document.getElementById('joinedInput');
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const logoutBtn = document.getElementById('logoutBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');

    const changePasswordModal = document.getElementById('changePasswordModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const changePasswordForm = document.getElementById('changePasswordForm');
    const passwordMessage = document.getElementById('passwordMessage');

    console.log('Element check:', {
        passwordInput,
        changePasswordModal
    }); 

    try {
        const result = await API.getProfile();
        
        if (result.success) {
            const user = result.data.user;
            
            displayName.innerText = user.name;
            usernameInput.value = user.username;
            passwordInput.value = "********"; 
            passwordInput.type = "password"; 

            const date = new Date(user.created_at);
            joinedInput.value = date.toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
        } else {
            console.error("Gagal load profil:", result.message);
            displayName.innerText = "Gagal memuat data";
            displayName.style.color = "red";
            
            if(result.message.includes("token")) {
                alert("Sesi habis, silakan login ulang.");
                Auth.logout();
            }
        }
    } catch (error) {
        console.error("Error koneksi:", error);
        displayName.innerText = "Koneksi ke Server Gagal";
        displayName.style.color = "red";
    }

    editBtn.addEventListener('click', () => {
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-flex';
        usernameInput.disabled = false;
        usernameInput.focus();
        usernameInput.style.backgroundColor = "rgba(255,255,255,0.8)"; 
    });

    togglePasswordBtn?.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        if (type === 'password') {
            togglePasswordBtn.className = 'fa-regular fa-eye password-toggle';
        } else {
            togglePasswordBtn.className = 'fa-regular fa-eye-slash password-toggle';
        }
    });

    saveBtn.addEventListener('click', async () => {
        const newUsername = usernameInput.value.trim();
        const currentName = displayName.innerText; 

        if (!newUsername) {
            alert('Username tidak boleh kosong!');
            return;
        }

        const originalBtnText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
        saveBtn.disabled = true;

        try {
            const updateResult = await API.updateProfile(currentName, newUsername);
            
            if (updateResult.success) {
                alert('✅ Profil berhasil diperbarui!');
                location.reload();
            } else {
                alert('❌ Gagal update profil: ' + updateResult.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan koneksi ke server.');
        } finally {
            saveBtn.innerHTML = originalBtnText;
            saveBtn.disabled = false;
        }
    });

    passwordInput.addEventListener('click', () => {
        console.log('Password field DIKLIK!'); 
        changePasswordModal.style.display = 'block';
        console.log('Modal display:', changePasswordModal.style.display); 
    });

    closeModal.addEventListener('click', () => {
        changePasswordModal.style.display = 'none';
        changePasswordForm.reset();
        passwordMessage.style.display = 'none';
    });

    cancelBtn.addEventListener('click', () => {
        changePasswordModal.style.display = 'none';
        changePasswordForm.reset();
        passwordMessage.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === changePasswordModal) {
            changePasswordModal.style.display = 'none';
            changePasswordForm.reset();
            passwordMessage.style.display = 'none';
        }
    });

    document.querySelectorAll('.password-toggle-modal').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input) {
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;
                this.classList.toggle('fa-eye');
                this.classList.toggle('fa-eye-slash');
            }
        });
    });

    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (newPassword.length < 6) {
            showMessage('❌ Password baru minimal 6 karakter!', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showMessage('❌ Password baru dan konfirmasi tidak cocok!', 'error');
            return;
        }
        
        const submitBtn = changePasswordForm.querySelector('.btn-submit');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';
        
        try {
            const result = await API.changePassword(currentPassword, newPassword);
            
            if (result.success) {
                showMessage('✅ ' + result.message, 'success');
                changePasswordForm.reset();
                
                setTimeout(() => {
                    changePasswordModal.style.display = 'none';
                    alert('Silakan login kembali dengan password baru Anda');
                    Auth.logout();
                }, 2000);
            } else {
                showMessage('❌ ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('❌ Gagal menghubungi server', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    function showMessage(message, type) {
        passwordMessage.textContent = message;
        passwordMessage.className = `alert alert-${type}`;
        passwordMessage.style.display = 'block';
        
        setTimeout(() => {
            passwordMessage.style.display = 'none';
        }, 5000);
    }

    deleteAccountBtn.addEventListener('click', async () => {
        const confirmation = prompt('Ketik "HAPUS" untuk menghapus akun (tidak bisa dibatalkan):');
        
        if (confirmation === 'HAPUS') {
            const result = await API.deleteAccount();
            
            if (result.success) {
                alert('✅ Akun berhasil dihapus');
                Auth.logout();
            } else {
                alert('❌ Gagal menghapus akun: ' + result.message);
            }
        }
    });

    logoutBtn.addEventListener('click', () => {
        if(confirm("Yakin ingin logout?")) {
            Auth.logout();
        }
    });
});