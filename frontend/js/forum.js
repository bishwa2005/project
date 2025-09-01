document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    const questionsList = document.getElementById('questions-list');
    const askQuestionForm = document.getElementById('ask-question-form');
    const userNameDisplay = document.getElementById('user-name-display');
    const myProfileLink = document.getElementById('my-profile-link');
    const logoutButton = document.getElementById('logout-button');

    const loadUserDetails = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/me', { headers: { 'x-auth-token': token } });
            if (!response.ok) { localStorage.removeItem('token'); window.location.href = 'login.html'; return; }
            const loggedInUser = await response.json();
            userNameDisplay.textContent = `Welcome, ${loggedInUser.name}`;
            myProfileLink.href = `profile.html?id=${loggedInUser.id}`;
        } catch (error) { console.error('Failed to load user details:', error); }
    };

    const fetchQuestions = async () => {
        const response = await fetch('http://localhost:5000/api/forum/questions', { headers: { 'x-auth-token': token } });
        const questions = await response.json();
        questionsList.innerHTML = '';
        questions.forEach(q => {
            questionsList.innerHTML += `<a href="question.html?id=${q.id}" class="list-group-item list-group-item-action"><div class="d-flex w-100 justify-content-between"><h5 class="mb-1">${q.title}</h5><small>Asked by: ${q.author_name}</small></div><p class="mb-1">${q.body.substring(0, 100)}...</p></a>`;
        });
    };

    askQuestionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('question-title').value;
        const body = document.getElementById('question-body').value;
        await fetch('http://localhost:5000/api/forum/questions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': token }, body: JSON.stringify({ title, body }) });
        bootstrap.Modal.getInstance(document.getElementById('askQuestionModal')).hide();
        fetchQuestions();
    });

    logoutButton.addEventListener('click', () => { localStorage.removeItem('token'); window.location.href = 'login.html'; });

    loadUserDetails();
    fetchQuestions();
});