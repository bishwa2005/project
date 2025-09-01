document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const requestsContainer = document.getElementById('requests-container');
    const userNameDisplay = document.getElementById('user-name-display');
    const myProfileLink = document.getElementById('my-profile-link');
    const logoutButton = document.getElementById('logout-button');
    const notificationBadge = document.getElementById('notification-badge');
    
    let loggedInUser = null;

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
        } catch (error) {
            console.error('Failed to load user details:', error);
        }
    };

    const fetchRequests = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/connections/requests', { headers: { 'x-auth-token': token } });
            const requests = await response.json();
            
            // Update notification badge in navbar
            if (requests.length > 0) {
                notificationBadge.textContent = requests.length;
                notificationBadge.style.display = 'inline';
            } else {
                notificationBadge.style.display = 'none';
            }

            renderRequests(requests);
        } catch(error) {
            console.error('Failed to fetch requests:', error);
            requestsContainer.innerHTML = '<p class="text-danger">Could not load requests.</p>';
        }
    };

    function renderRequests(requests) {
        requestsContainer.innerHTML = '';
        if (requests.length === 0) {
            requestsContainer.innerHTML = '<p class="text-muted">No pending connection requests.</p>';
            return;
        }
        requests.forEach(req => {
            const requestElement = `
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <a href="profile.html?id=${req.requester_id}" class="text-decoration-none">
                            <h5 class="mb-1">${req.name}</h5>
                        </a>
                        <p class="mb-1 text-muted small">${req.domain}</p>
                    </div>
                    <div>
                        <button class="btn btn-success me-2 respond-btn" data-requester-id="${req.requester_id}" data-status="accepted">Accept</button>
                        <button class="btn btn-danger respond-btn" data-requester-id="${req.requester_id}" data-status="rejected">Reject</button>
                    </div>
                </div>`;
            requestsContainer.innerHTML += requestElement;
        });
    }

    requestsContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('respond-btn')) {
            const requesterId = e.target.dataset.requesterId;
            const status = e.target.dataset.status;
            
            try {
                const response = await fetch(`http://localhost:5000/api/connections/respond/${requesterId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                    body: JSON.stringify({ status })
                });

                if (response.ok) {
                    fetchRequests(); // Refresh the list of requests
                } else {
                    alert('Failed to respond to request.');
                }
            } catch (error) {
                console.error('Error responding to request:', error);
            }
        }
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
    
    // Initial Load
    await loadUserDetails();
    await fetchRequests();
});document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const requestsContainer = document.getElementById('requests-container');
    const userNameDisplay = document.getElementById('user-name-display');
    const myProfileLink = document.getElementById('my-profile-link');
    const logoutButton = document.getElementById('logout-button');
    const notificationBadge = document.getElementById('notification-badge');
    
    let loggedInUser = null;

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
        } catch (error) {
            console.error('Failed to load user details:', error);
        }
    };

    const fetchRequests = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/connections/requests', { headers: { 'x-auth-token': token } });
            const requests = await response.json();
            
            // Update notification badge in navbar
            if (requests.length > 0) {
                notificationBadge.textContent = requests.length;
                notificationBadge.style.display = 'inline';
            } else {
                notificationBadge.style.display = 'none';
            }

            renderRequests(requests);
        } catch(error) {
            console.error('Failed to fetch requests:', error);
            requestsContainer.innerHTML = '<p class="text-danger">Could not load requests.</p>';
        }
    };

    function renderRequests(requests) {
        requestsContainer.innerHTML = '';
        if (requests.length === 0) {
            requestsContainer.innerHTML = '<p class="text-muted">No pending connection requests.</p>';
            return;
        }
        requests.forEach(req => {
            const requestElement = `
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <a href="profile.html?id=${req.requester_id}" class="text-decoration-none">
                            <h5 class="mb-1">${req.name}</h5>
                        </a>
                        <p class="mb-1 text-muted small">${req.domain}</p>
                    </div>
                    <div>
                        <button class="btn btn-success me-2 respond-btn" data-requester-id="${req.requester_id}" data-status="accepted">Accept</button>
                        <button class="btn btn-danger respond-btn" data-requester-id="${req.requester_id}" data-status="rejected">Reject</button>
                    </div>
                </div>`;
            requestsContainer.innerHTML += requestElement;
        });
    }

    requestsContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('respond-btn')) {
            const requesterId = e.target.dataset.requesterId;
            const status = e.target.dataset.status;
            
            try {
                const response = await fetch(`http://localhost:5000/api/connections/respond/${requesterId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                    body: JSON.stringify({ status })
                });

                if (response.ok) {
                    fetchRequests(); // Refresh the list of requests
                } else {
                    alert('Failed to respond to request.');
                }
            } catch (error) {
                console.error('Error responding to request:', error);
            }
        }
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
    
    // Initial Load
    await loadUserDetails();
    await fetchRequests();
});