document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const leaderboardList = document.getElementById('leaderboard-list');
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

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch('/api/users/ranking', { headers: { 'x-auth-token': token } });
            const users = await response.json();
            leaderboardList.innerHTML = '';
            if (users.length === 0) {
                leaderboardList.innerHTML = '<li class="list-group-item">No contributors yet.</li>';
                return;
            }
            users.forEach(user => {
                const listItem = `
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">${user.name}</div>
                            ${user.domain}
                        </div>
                        <span class="badge bg-primary rounded-pill">${user.score} points</span>
                    </li>`;
                leaderboardList.innerHTML += listItem;
            });
        } catch (error) { 
            console.error('Failed to fetch leaderboard:', error);
            leaderboardList.innerHTML = '<li class="list-group-item text-danger">Could not load leaderboard.</li>';
        }
    };
    
    logoutButton.addEventListener('click', () => { 
        localStorage.removeItem('token'); 
        window.location.href = 'login.html'; 
    });

    await loadUserDetails();
    await fetchLeaderboard();
});