document.addEventListener('DOMContentLoaded', async () => {
    // --- 1. SETUP & PAGE PROTECTION ---
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // --- DOM ELEMENTS ---
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');
    const profileMainContent = document.getElementById('profile-main-content');
    const editProfileForm = document.getElementById('edit-profile-form');
    const addProjectForm = document.getElementById('add-project-form');
    const userNameDisplay = document.getElementById('user-name-display');
    const myProfileLink = document.getElementById('my-profile-link');
    const logoutButton = document.getElementById('logout-button');
    const photoUploadInput = document.getElementById('photo-upload');
    const profilePictureImg = document.getElementById('profile-picture');
    
    // --- STATE ---
    let loggedInUser = null;

    // --- 2. DATA FETCHING FUNCTIONS ---

    // Fetches details of the currently logged-in user
    const loadUserDetails = async () => {
        try {
            const meResponse = await fetch('/api/auth/me', { headers: { 'x-auth-token': token } });
            if (!meResponse.ok) {
                localStorage.removeItem('token');
                window.location.href = 'login.html';
                return;
            }
            loggedInUser = await meResponse.json();
            userNameDisplay.textContent = `Welcome, ${loggedInUser.name}`;
            myProfileLink.href = `profile.html?id=${loggedInUser.id}`;
        } catch (e) { 
            console.error("Could not fetch logged-in user's data", e);
        }
    };
    
    // Fetches all details for the profile being viewed
    const fetchAndRenderProfile = async () => {
        try {
            const response = await fetch(`/api/profile/${userId}`, { headers: { 'x-auth-token': token } });
            if (!response.ok) throw new Error('Failed to fetch profile');
            const profile = await response.json();
            renderProfile(profile);
        } catch (error) {
            profileMainContent.innerHTML = `<p class="text-danger text-center">${error.message}</p>`;
        }
    };

    // --- 3. UI RENDERING FUNCTIONS ---

    function renderProfile(profile) {
        const { user, projects, connections, rank } = profile;
        const isOwnProfile = loggedInUser && loggedInUser.id === user.id;

        const editProfileButton = isOwnProfile ? `<button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#editProfileModal">Edit Profile</button>` : '';
        const addProjectButton = isOwnProfile ? `<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addProjectModal">Add Project</button>` : '';

        // Render Profile Picture
        if (user.profile_picture && user.profile_picture !== 'default-avatar.png') {
            profilePictureImg.src = `/uploads/${user.profile_picture}`;
        } else {
            profilePictureImg.src = `https://placehold.co/150x150/EFEFEF/AAAAAA&text=${user.name.charAt(0)}`;
        }
        photoUploadInput.disabled = !isOwnProfile;
        if (!isOwnProfile) {
            profilePictureImg.parentElement.style.cursor = 'default';
            profilePictureImg.parentElement.removeAttribute('title');
        }

       
        profileMainContent.innerHTML = `
            <div class="card mb-4">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div><h2 class="card-title">${user.name}</h2><h5 class="card-subtitle mb-2 text-muted">${user.domain}</h5></div>
                        ${editProfileButton}
                    </div><hr>
                    <p><strong>Bio:</strong> ${user.bio || 'Not provided.'}</p>
                    <p><strong>Skills:</strong> ${user.skills ? user.skills.join(', ') : 'None listed'}</p>
                </div>
            </div>
            <h3 class="mt-4">Coding Platform Stats</h3>
            <div class="row">
                <div class="col-md-6 mb-3"><div class="card h-100"><div class="card-body">
                    <h5 class="card-title"><i class="bi bi-code-slash"></i> LeetCode</h5>
                    <a href="${user.leetcode_url || '#'}" target="_blank" class="btn btn-sm btn-dark mb-2 ${!user.leetcode_url ? 'disabled' : ''}">View Profile</a>
                    <div id="leetcode-stats-container"><p class="text-muted small">No profile provided.</p></div>
                </div></div></div>
                <div class="col-md-6 mb-3"><div class="card h-100"><div class="card-body">
                    <h5 class="card-title"><i class="bi bi-bar-chart-line-fill"></i> Codeforces</h5>
                    <a href="${user.codeforces_url || '#'}" target="_blank" class="btn btn-sm btn-danger mb-2 ${!user.codeforces_url ? 'disabled' : ''}">View Profile</a>
                    <div id="codeforces-stats-container"><p class="text-muted small">No profile provided.</p></div>
                </div></div></div>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-4"><h3>Projects</h3>${addProjectButton}</div>
            <div id="projects-list"></div>`;

        // Populate Side Column
        document.getElementById('profile-rank').textContent = rank;
        document.getElementById('contact-info-list').innerHTML = `
            <li class="list-group-item"><i class="bi bi-envelope-fill me-2"></i> ${user.email || 'Not provided'}</li>
            <li class="list-group-item"><i class="bi bi-linkedin me-2"></i> <a href="${user.linkedin_url || '#'}" target="_blank" class="text-decoration-none">${user.linkedin_url ? 'View Profile' : 'Not Provided'}</a></li>
            <li class="list-group-item"><i class="bi bi-whatsapp me-2"></i> ${user.whatsapp_number || 'Not Provided'}</li>
            <li class="list-group-item"><i class="bi bi-twitter-x me-2"></i> <a href="${user.x_url || '#'}" target="_blank" class="text-decoration-none">${user.x_url ? 'View Profile' : 'Not Provided'}</a></li>
        `;
        
        // Render Projects
        const projectsList = document.getElementById('projects-list');
        projectsList.innerHTML = '';
        if (projects.length === 0) {
            projectsList.innerHTML = '<p class="text-muted">No projects listed yet.</p>';
        } else {
            projects.forEach(p => {
                const deleteButton = isOwnProfile ? `<button class="btn btn-sm btn-outline-danger delete-project-btn" data-project-id="${p.id}"><i class="bi bi-trash"></i></button>` : '';
                projectsList.innerHTML += `
                    <div class="card mb-3"><div class="card-body"><div class="d-flex justify-content-between">
                    <h5 class="card-title">${p.title} ${p.is_current ? '<span class="badge bg-success">Current</span>' : '<span class="badge bg-secondary">Completed</span>'}</h5>
                    ${deleteButton}</div><p class="card-text">${p.description || 'No description.'}</p>
                    <a href="${p.project_url || '#'}" target="_blank" class="card-link ${!p.project_url ? 'disabled' : ''}">View Project</a></div></div>`;
            });
        }
        
        if (isOwnProfile) {
            editProfileForm.innerHTML = `
                <div class="mb-3"><label class="form-label">Bio</label><textarea class="form-control" id="edit-bio" rows="3">${user.bio || ''}</textarea></div>
                <div class="mb-3"><label class="form-label">Skills (comma separated)</label><input type="text" class="form-control" id="edit-skills" value="${user.skills ? user.skills.join(', ') : ''}"></div>
                <hr><h5 class="mb-3">Contact Information</h5>
                <div class="mb-3"><label class="form-label">LinkedIn URL</label><input type="url" class="form-control" id="edit-linkedin" value="${user.linkedin_url || ''}"></div>
                <div class="mb-3"><label class="form-label">WhatsApp Number</label><input type="tel" class="form-control" id="edit-whatsapp" value="${user.whatsapp_number || ''}"></div>
                <div class="mb-3"><label class="form-label">X (Twitter) URL</label><input type="url" class="form-control" id="edit-x" value="${user.x_url || ''}"></div>
                <hr><h5 class="mb-3">Coding Platforms</h5>
                <div class="mb-3"><label class="form-label">LeetCode URL</label><input type="url" class="form-control" id="edit-leetcode" value="${user.leetcode_url || ''}"></div>
                <div class="mb-3"><label class="form-label">Codeforces URL</label><input type="url" class="form-control" id="edit-codeforces" value="${user.codeforces_url || ''}"></div>
                <hr><h5 class="mb-3">Update Credentials</h5>
                <p class="text-muted small">To change email or password, you must provide your current password.</p>
                <div class="mb-3"><label class="form-label">Current Password</label><input type="password" class="form-control" id="edit-current-password"></div>
                <div class="mb-3"><label class="form-label">New Email</label><input type="email" class="form-control" id="edit-email"></div>
                <div class="mb-3"><label class="form-label">New Password</label><input type="password" class="form-control" id="edit-password"></div>
                <button type="submit" class="btn btn-primary">Save Changes</button>`;
        }
        
        // Fetch and Render platform stats
        if (user.leetcode_url) fetchAndRenderLeetCode(user.leetcode_url);
        if (user.codeforces_url) fetchAndRenderCodeforces(user.codeforces_url);
    }

    async function fetchAndRenderLeetCode(url) {
        const username = url.split('/').filter(Boolean).pop();
        const container = document.getElementById('leetcode-stats-container');
        try {
            const res = await fetch(`/api/platforms/leetcode/${encodeURIComponent(username)}`, { headers: { 'x-auth-token': token } });
            if (!res.ok) throw new Error();
            const data = await res.json();
            const stats = data.submitStatsGlobal?.acSubmissionNum;
            const total = Array.isArray(stats) ? (stats.find(s=>s.difficulty==='All')?.count ?? 0) : 0;
            container.innerHTML = `<p class="mb-1"><strong>Total Solved:</strong> ${total}</p>`;
        } catch (e) { 
            console.error('LeetCode fetch error:', e);
            container.innerHTML = `<p class="text-danger small">Could not load stats.</p>`; 
        }
    }

    async function fetchAndRenderCodeforces(url) {
        const username = url.split('/').filter(Boolean).pop();
        const container = document.getElementById('codeforces-stats-container');
        container.innerHTML = `<p class="text-muted small">Loading...</p>`;
        try {
            const res = await fetch(`/api/platforms/codeforces/${encodeURIComponent(username)}`, { headers: { 'x-auth-token': token } });
            const text = await res.text();
            let data;
            try { data = JSON.parse(text); } catch (_) { data = text; }

            if (!res.ok) {
                console.error(`[Codeforces] HTTP ${res.status}`, data);
                const serverMsg = (data && (data.msg || data.message)) || (typeof data === 'string' ? data : '');
                container.innerHTML = `<p class="text-danger small">Could not load stats. ${serverMsg ? `(${serverMsg})` : ''}</p>`;
                return;
            }

            // Accept several possible response shapes returned by different backends
            let submissions = [];
            if (Array.isArray(data)) submissions = data;
            else if (Array.isArray(data.result)) submissions = data.result;
            else if (Array.isArray(data.submissions)) submissions = data.submissions;
            else if (Array.isArray(data.data)) submissions = data.data;
            else if (Array.isArray(data.result?.data)) submissions = data.result.data;

            if (!Array.isArray(submissions) || submissions.length === 0) {
                container.innerHTML = `<p class="text-muted small">No solved submissions found.</p>`;
                return;
            }

            // Count unique solved problems (use problem name as identifier)
            const solved = new Set(
                submissions
                    .filter(sub => sub.verdict === 'OK')
                    .map(sub => {
                        if (sub.problem && (sub.problem.name || sub.problem.index)) return `${sub.problem.name || ''}`.trim();
                        if (sub.problemName) return String(sub.problemName).trim();
                        return JSON.stringify(sub).slice(0, 40);
                    })
                    .filter(Boolean)
            );

            container.innerHTML = `<p class="mb-1"><strong>Total Solved:</strong> ${solved.size}</p>`;
        } catch (e) { 
            console.error('Could not load Codeforces stats:', e);
            container.innerHTML = `<p class="text-danger small">Could not load stats.</p>`; 
        }
    }

    // --- 4. EVENT LISTENERS ---

    // Handle "Add Project" form submission
    addProjectForm.addEventListener('submit', async e => {
        e.preventDefault();
        if (!loggedInUser) { alert('User data is still loading, please try again.'); return; }
        const newProject = { title: document.getElementById('project-title').value, description: document.getElementById('project-description').value, project_url: document.getElementById('project-url').value, is_current: document.getElementById('project-is-current').checked };
        try {
            const response = await fetch('/api/profile/projects', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': token }, body: JSON.stringify(newProject) });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.msg || 'Failed to add project'); }
            bootstrap.Modal.getInstance(document.getElementById('addProjectModal')).hide();
            addProjectForm.reset();
            fetchAndRenderProfile();
        } catch (error) { console.error('Add project error:', error); alert(`There was an error: ${error.message}`); }
    });

    // Handle "Edit Profile" form submission
    editProfileForm.addEventListener('submit', async e => {
        e.preventDefault();
        const updatedProfile = { 
            bio: document.getElementById('edit-bio').value, 
            skills: document.getElementById('edit-skills').value.split(',').map(s => s.trim()), 
            linkedin_url: document.getElementById('edit-linkedin').value, 
            whatsapp_number: document.getElementById('edit-whatsapp').value,
            x_url: document.getElementById('edit-x').value,
            leetcode_url: document.getElementById('edit-leetcode').value, 
            codeforces_url: document.getElementById('edit-codeforces').value
        };
        await fetch('/api/profile/me', {
            method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify(updatedProfile)
        });

        const currentPassword = document.getElementById('edit-current-password').value;
        const newEmail = document.getElementById('edit-email').value;
        const newPassword = document.getElementById('edit-password').value;
        if (currentPassword && (newEmail || newPassword)) {
            await fetch('/api/profile/credentials', {
                method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ currentPassword, newEmail, newPassword })
            });
        }

        bootstrap.Modal.getInstance(document.getElementById('editProfileModal')).hide();
        fetchAndRenderProfile();
    });

    // Handle "Delete Project" button clicks
    document.addEventListener('click', async e => {
        const deleteButton = e.target.closest('.delete-project-btn');
        if (deleteButton) {
            const projectId = deleteButton.dataset.projectId;
            
            // Use SweetAlert2 for confirmation
            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    // If user confirms, proceed with the deletion
                    await fetch(`/api/profile/projects/${projectId}`, { 
                        method: 'DELETE', 
                        headers: { 'x-auth-token': token } 
                    });
                    
                    // Show a success message
                    Swal.fire(
                        'Deleted!',
                        'Your project has been deleted.',
                        'success'
                    );
                    
                    fetchAndRenderProfile(); // Refresh the profile to show the change
                }
            });
        }
    });


    // Handle photo upload
    photoUploadInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('profilePhoto', file);
        const uploadStatus = document.getElementById('upload-status');
        uploadStatus.textContent = 'Uploading...';
        try {
            const response = await fetch('/api/profile/photo', {
                method: 'POST',
                headers: { 'x-auth-token': token },
                body: formData,
            });
            if (!response.ok) throw new Error('Upload failed');
            uploadStatus.textContent = '';
            fetchAndRenderProfile();
        } catch (error) {
            uploadStatus.textContent = 'Upload failed.';
            console.error('Photo upload error:', error);
        }
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    // --- 5. INITIAL PAGE LOAD ---
    await loadUserDetails();
    await fetchAndRenderProfile();
});