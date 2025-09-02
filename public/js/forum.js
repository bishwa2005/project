document.addEventListener('DOMContentLoaded', async () => {
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
    
    let loggedInUser = null;

    const loadUserDetails = async () => {
        try {
            const response = await fetch('/api/auth/me', { headers: { 'x-auth-token': token } });
            if (!response.ok) { 
                localStorage.removeItem('token'); 
                window.location.href = 'login.html'; 
                return; 
            }
            loggedInUser = await response.json();
            userNameDisplay.textContent = `Welcome, ${loggedInUser.name}`;
            myProfileLink.href = `profile.html?id=${loggedInUser.id}`;
        } catch (error) { 
            console.error('Failed to load user details:', error); 
        }
    };

    const fetchQuestions = async () => {
        try {
            const response = await fetch('/api/forum/questions', { headers: { 'x-auth-token': token } });
            const questions = await response.json();
            renderQuestions(questions);
        } catch (error) {
            console.error('Failed to fetch questions:', error);
            questionsList.innerHTML = '<p class="text-danger">Could not load questions.</p>';
        }
    };

    function renderQuestions(questions) {
    questionsList.innerHTML = '';
    if (questions.length === 0) {
        questionsList.innerHTML = '<p class="text-muted">No questions yet. Be the first!</p>';
        return;
    }
    questions.forEach(q => {
        // This conditional logic now works because q.user_id is available
        const deleteButton = (loggedInUser && loggedInUser.id === q.user_id)
            ? `<button class="btn btn-sm btn-outline-danger delete-question-btn" data-question-id="${q.id}"><i class="bi bi-trash"></i></button>`
            : '';

        const questionElement = `
            <div class="list-group-item list-group-item-action">
                <div class="d-flex w-100 justify-content-between">
                    <a href="question.html?id=${q.id}" class="text-decoration-none text-dark flex-grow-1">
                        <h5 class="mb-1">${q.title}</h5>
                    </a>
                    <div class="d-flex align-items-center">
                        <small class="text-muted me-3">Asked by: ${q.author_name}</small>
                        ${deleteButton}
                    </div>
                </div>
                <p class="mb-1 text-muted">${q.body.substring(0, 100)}...</p>
            </div>`;
        questionsList.innerHTML += questionElement;
    });
}

    askQuestionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('question-title').value;
        const body = document.getElementById('question-body').value;
        await fetch('/api/forum/questions', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token }, 
            body: JSON.stringify({ title, body }) 
        });
        bootstrap.Modal.getInstance(document.getElementById('askQuestionModal')).hide();
        fetchQuestions();
    });

    questionsList.addEventListener('click', async (e) => {
        const deleteButton = e.target.closest('.delete-question-btn');
        if (deleteButton) {
            const questionId = deleteButton.dataset.questionId;
            
            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const response = await fetch(`/api/forum/questions/${questionId}`, {
                            method: 'DELETE',
                            headers: { 'x-auth-token': token }
                        });
                        if (response.ok) {
                            fetchQuestions();
                        } else {
                            alert('Failed to delete question.');
                        }
                    } catch (error) {
                        console.error('Error deleting question:', error);
                    }
                }
            });
        }
    });

    logoutButton.addEventListener('click', () => { 
        localStorage.removeItem('token'); 
        window.location.href = 'login.html'; 
    });
    
    // Ensure user details are loaded before fetching questions
    await loadUserDetails();
    await fetchQuestions();
});