document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const chatForm = document.getElementById('ai-chat-form');
    const chatInput = document.getElementById('ai-chat-input');
    const chatLog = document.getElementById('ai-chat-log');
    // You should also include the logic to populate your navbar here
    // const userNameDisplay = document.getElementById('user-name-display'); etc.

    let loggedInUser = null; // We'll need this for the user's avatar

    const loadUserDetails = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/me', { headers: { 'x-auth-token': token } });
            loggedInUser = await response.json();
            // Populate navbar
        } catch(e) { console.error("Could not load user details"); }
    };
    
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        appendMessage(userMessage, 'user');
        chatInput.value = '';
        chatInput.disabled = true;

        const typingIndicator = appendMessage('...', 'ai', true);

        try {
            const response = await fetch('http://localhost:5000/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ prompt: userMessage })
            });
            const data = await response.json();
            
            typingIndicator.remove();
            appendMessage(data.response, 'ai');
        } catch (error) {
            typingIndicator.remove();
            appendMessage('Sorry, I am having trouble connecting.', 'ai');
        } finally {
            chatInput.disabled = false;
            chatInput.focus();
        }
    });

    function appendMessage(text, sender, isTyping = false) {
        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('chat-message', `${sender}-message`);
        
        let avatarInitial = sender === 'ai' ? '🤖' : (loggedInUser ? loggedInUser.name.charAt(0) : 'U');
        
        messageWrapper.innerHTML = `
            <div class="avatar">${avatarInitial}</div>
            <div class="message-content">${text}</div>
        `;
        
        if(isTyping) messageWrapper.classList.add('typing-indicator');

        chatLog.appendChild(messageWrapper);
        chatLog.scrollTop = chatLog.scrollHeight;
        return messageWrapper;
    }

    loadUserDetails();
});