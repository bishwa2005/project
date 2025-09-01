document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const questionId = params.get('id');
    const questionDetails = document.getElementById('question-details');
    const answersList = document.getElementById('answers-list');
    const postAnswerForm = document.getElementById('post-answer-form');
    const userNameDisplay = document.getElementById('user-name-display');
    const myProfileLink = document.getElementById('my-profile-link');
    const logoutButton = document.getElementById('logout-button');
    
    const loadUserDetails = async () => {
        try {
            const response = await fetch('/api/auth/me', { headers: { 'x-auth-token': token } });
            if (!response.ok) { localStorage.removeItem('token'); window.location.href = 'login.html'; return; }
            const loggedInUser = await response.json();
            userNameDisplay.textContent = `Welcome, ${loggedInUser.name}`;
            myProfileLink.href = `profile.html?id=${loggedInUser.id}`;
        } catch (error) { console.error('Failed to load user details:', error); }
    };

    const fetchQuestionAndAnswers = async () => {
        const response = await fetch(`/api/forum/questions/${questionId}`, { headers: { 'x-auth-token': token } });
        const data = await response.json();
        questionDetails.innerHTML = `<h2>${data.question.title}</h2><p>${data.question.body}</p><small>Asked by: ${data.question.author_name}</small>`;
        answersList.innerHTML = '';
        data.answers.forEach(answer => {
            const isBest = answer.is_best_answer ? '<span class="badge bg-success">Best Answer</span>' : '';
            const acceptButton = (data.isAsker && !answer.is_best_answer) ? `<button class="btn btn-sm btn-success accept-answer-btn" data-answer-id="${answer.id}">Accept as Best</button>` : '';
            answersList.innerHTML += `<div class="card mb-3"><div class="card-body"><p>${answer.body}</p><small>Answered by: ${answer.author_name}</small><div class="mt-2">${isBest} ${acceptButton}</div></div></div>`;
        });
    };

    postAnswerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = document.getElementById('answer-body').value;
        await fetch(`/api/forum/questions/${questionId}/answers`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': token }, body: JSON.stringify({ body }) });
        fetchQuestionAndAnswers();
        postAnswerForm.reset();
    });
    
    document.body.addEventListener('click', async (e) => {
        if (e.target.classList.contains('accept-answer-btn')) {
            const answerId = e.target.dataset.answerId;
            await fetch(`/api/forum/answers/${answerId}/accept`, { method: 'PUT', headers: { 'x-auth-token': token } });
            fetchQuestionAndAnswers();
        }
    });

    logoutButton.addEventListener('click', () => { localStorage.removeItem('token'); window.location.href = 'login.html'; });

    await loadUserDetails();
    fetchQuestionAndAnswers();
});