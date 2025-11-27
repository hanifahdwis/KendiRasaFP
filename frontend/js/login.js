const loginForm = document.getElementById('loginForm');
const messageDiv = document.getElementById('message');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const btn = document.querySelector('.btn-primary');

    btn.innerText = 'Loading...';
    btn.disabled = true;

    try {
        const result = await API.login(username, password);

        if (result.success) {
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));

            window.location.href = 'profile.html'; 
        } else {
            throw new Error(result.message || 'Login gagal');
        }
    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.innerText = error.message;
        messageDiv.style.display = 'block';
        btn.innerText = 'Log in';
        btn.disabled = false;
    }
});