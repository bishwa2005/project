document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const studentCardsContainer = document.getElementById('student-cards-container');
    const connectionsList = document.getElementById('connections-list');
    const searchInput = document.getElementById('search-name');
    const domainFilter = document.getElementById('filter-domain');
    const logoutButton = document.getElementById('logout-button');
    const userNameDisplay = document.getElementById('user-name-display');
    const myProfileLink = document.getElementById('my-profile-link');
    const notificationBadge = document.getElementById('notification-badge');

    let allUsers = [];
    let myConnections = [];
    let loggedInUser = null;

    const fetchData = async () => {
        await Promise.all([
            loadUserDetails(),
            fetchUsers(),
            fetchConnections(),
            fetchNotifications()
        ]);
        renderUI();
    };

    const loadUserDetails = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/me', { headers: { 'x-auth-token': token } });
            if (!response.ok) {
                localStorage.removeItem('token');
                window.location.href = 'login.html';
                return;
            }
            loggedInUser = await response.json();
            userNameDisplay.textContent = `Welcome, ${loggedInUser.name}`;
            myProfileLink.href = `profile.html?id=${loggedInUser.id}`;
        } catch (error) { console.error('Failed to load user details:', error); }
    };

    const fetchUsers = async () => {
        const nameQuery = searchInput.value;
        const domainQuery = domainFilter.value;
        let url = 'http://localhost:5000/api/users?';
        if (nameQuery) url += `name=${nameQuery}&`;
        if (domainQuery) url += `domain=${domainQuery}`;

        try {
            const response = await fetch(url, { method: 'GET', headers: { 'x-auth-token': token } });
            allUsers = await response.json();
        } catch (error) { console.error('Error fetching users:', error); }
    };

    const fetchConnections = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/users/connections', { headers: { 'x-auth-token': token } });
            myConnections = await response.json();
        } catch (error) { console.error('Error fetching connections:', error); }
    };
    
    const fetchNotifications = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/connections/requests', { headers: { 'x-auth-token': token } });
            const requests = await response.json();
            if (requests.length > 0) {
                notificationBadge.textContent = requests.length;
                notificationBadge.style.display = 'inline';
            } else {
                notificationBadge.style.display = 'none';
            }
        } catch (error) { console.error('Error fetching notifications:', error); }
    };

    const renderUI = () => {
        renderUsers(allUsers);
        renderConnections(myConnections);
    };

    const renderUsers = (users) => {
        studentCardsContainer.innerHTML = '';
        users.forEach(user => {
            let buttonHtml = '';
            if (user.status === 'accepted') {
                buttonHtml = `<button class="btn btn-secondary disconnect-btn w-100" data-user-id="${user.id}">Disconnect</button>`;
            } else if (user.status === 'pending') {
                if (user.request_direction === 'sent') {
                    buttonHtml = `<button class="btn btn-outline-secondary w-100" disabled>Pending</button>`;
                } else {
                    buttonHtml = `<a href="notifications.html" class="btn btn-info w-100">Respond to Request</a>`;
                }
            } else {
                buttonHtml = `<button class="btn btn-primary connect-btn w-100" data-user-id="${user.id}">Connect</button>`;
            }
            
            // --- NEW: Logic to determine the profile picture source ---
            const imgSrc = (user.profile_picture && user.profile_picture !== 'default-avatar.png')
                ? `http://localhost:5000/uploads/${user.profile_picture}`
                : `https://placehold.co/80x80/EFEFEF/AAAAAA&text=${user.name.charAt(0)}`;

            const card = `
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card h-100">
                        <a href="profile.html?id=${user.id}" class="text-decoration-none text-dark d-block flex-grow-1">
                            <div class="card-body text-center">
                                <img src="${imgSrc}" alt="${user.name}" class="rounded-circle mb-3" width="80" height="80" style="object-fit: cover;">
                                <h5 class="card-title">${user.name}</h5>
                                <h6 class="card-subtitle mb-2 text-muted">${user.domain}</h6>
                                <p class="card-text small">${user.bio || 'No bio provided.'}</p>
                            </div>
                        </a>
                        <div class="card-footer bg-transparent border-0 p-3">
                            ${buttonHtml}
                        </div>
                    </div>
                </div>`;
            studentCardsContainer.innerHTML += card;
        });
    };

    const renderConnections = (connections) => {
        connectionsList.innerHTML = '';
        if (connections.length === 0) {
            connectionsList.innerHTML = '<li class="list-group-item text-muted">No connections yet.</li>';
            return;
        }
        connections.forEach(conn => {
            connectionsList.innerHTML += `<li class="list-group-item">${conn.name}</li>`;
        });
    };

    document.addEventListener('click', async (e) => {
        const userId = e.target.dataset.userId;
        if (e.target.classList.contains('connect-btn')) {
            await fetch(`http://localhost:5000/api/connections/send/${userId}`, { method: 'POST', headers: { 'x-auth-token': token } });
            fetchData();
        }
        if (e.target.classList.contains('disconnect-btn')) {
            await fetch(`http://localhost:5000/api/connections/disconnect/${userId}`, { method: 'DELETE', headers: { 'x-auth-token': token } });
            fetchData();
        }
    });

    searchInput.addEventListener('input', async () => { await fetchUsers(); renderUI(); });
    domainFilter.addEventListener('change', async () => { await fetchUsers(); renderUI(); });
    logoutButton.addEventListener('click', () => { localStorage.removeItem('token'); window.location.href = 'login.html'; });

    fetchData();
});