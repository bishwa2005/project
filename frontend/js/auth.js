document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const messageContainer = document.getElementById('message-container');

    // --- REGISTRATION LOGIC ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const domain = document.getElementById('domain').value;
            const skills = document.getElementById('skills').value.split(',').map(skill => skill.trim());
            const bio = document.getElementById('bio').value;
            try {
                const response = await fetch('http://localhost:5000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, domain, skills, bio }),
                });
                const data = await response.json();
                if (response.ok) {
                    messageContainer.innerHTML = `<div class="alert alert-success">Registration successful! Redirecting to login...</div>`;
                    setTimeout(() => { window.location.href = 'login.html'; }, 2000);
                } else {
                    messageContainer.innerHTML = `<div class="alert alert-danger">${data.msg || 'An error occurred.'}</div>`;
                }
            } catch (error) {
                messageContainer.innerHTML = `<div class="alert alert-danger">Could not connect to the server.</div>`;
            }
        });
    }

    // --- LOGIN LOGIC ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    messageContainer.innerHTML = `<div class="alert alert-success">Login successful! Redirecting...</div>`;
                    setTimeout(() => { window.location.href = `profile.html?id=${data.userId}`; }, 1500);
                } else {
                    messageContainer.innerHTML = `<div class="alert alert-danger">${data.msg || 'An error occurred.'}</div>`;
                }
            } catch (error) {
                messageContainer.innerHTML = `<div class="alert alert-danger">Could not connect to the server.</div>`;
            }
        });
    }
});