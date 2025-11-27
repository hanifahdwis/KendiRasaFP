const signupForm = document.getElementById('signupForm');
const messageDiv = document.getElementById('message');

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const btn = document.querySelector('.btn-primary');

    const originalText = btn.innerText;
    btn.innerText = 'Loading...';
    btn.disabled = true;

    try {
        const result = await API.register(name, username, password);

        if (result.success) {
            messageDiv.className = 'message success';
            messageDiv.innerText = 'Registrasi Berhasil! Mengalihkan ke login...';
            messageDiv.style.display = 'block';
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            throw new Error(result.message || 'Registrasi gagal');
        }
    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.innerText = error.message;
        messageDiv.style.display = 'block';
        btn.innerText = originalText;
        btn.disabled = false;
    }
});