document.addEventListener('DOMContentLoaded', function() {
    // Check login status and update buttons
    function updateButtonLinks() {
        const token = localStorage.getItem('token');
        const heroButton = document.querySelector('.hero-buttons .primary-btn');
        const secondHeroButton = document.querySelector('.second-hero-text .primary-btn');
        const currentLang = localStorage.getItem('language') || 'en';

        if (token) {
            // User is logged in
            heroButton.href = './community.html';
            heroButton.setAttribute('data-i18n', 'join_community');
            // Let the translation system handle the text
            applyTranslations(currentLang);
            secondHeroButton.href = './shop.html';
            secondHeroButton.setAttribute('data-i18n', 'visit_shop');
            applyTranslations(currentLang);
        } else {
            // User is not logged in - both buttons should go to login page
            const loginPagePath = 'login.html';  // Since we're in the pages directory
            heroButton.href = loginPagePath;
            heroButton.setAttribute('data-i18n', 'create_baby_profile');
            // Let the translation system handle the text
            applyTranslations(currentLang);
            secondHeroButton.href = loginPagePath;
            secondHeroButton.setAttribute('data-i18n', 'create_baby_profile');
            applyTranslations(currentLang);
        }
    }

    // Initial check
    updateButtonLinks();

    // Listen for storage changes (for when user logs in/out in another tab)
    window.addEventListener('storage', function(e) {
        if (e.key === 'token' || e.key === 'language') {
            updateButtonLinks();
        }
    });

    // Listen for language changes from the language toggle button
    window.addEventListener('languageChanged', function() {
        updateButtonLinks();
    });

    // Chat elements
    const chatButton = document.getElementById('chatButton');
    const chatArea = document.getElementById('chatArea');
    const closeChat = document.querySelector('.close-chat');
    const chatQuestions = document.querySelector('.chat-questions');
    const userInputField = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');

    // Create chat message element
    function createChatMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
        messageDiv.textContent = content;
        return messageDiv;
    }

    // Chat button click handler
    chatButton.addEventListener('click', function() {
        if (chatArea.classList.contains('active')) {
            chatArea.classList.remove('active');
        } else {
            chatArea.classList.add('active');
        }
    });

    // Close chat button click handler
    closeChat.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent any default behavior
        e.stopPropagation(); // Stop event bubbling
        chatArea.classList.remove('active');
    });

    // Close chat when clicking outside
    document.addEventListener('click', function(e) {
        if (!chatArea.contains(e.target) && !chatButton.contains(e.target)) {
            chatArea.classList.remove('active');
        }
    });

    // Dynamic chat implementation
    async function sendChatQuestion() {
        const userQuestion = userInputField.value.trim();
        if (!userQuestion) return;

        chatQuestions.appendChild(createChatMessage(userQuestion, true));
        userInputField.value = '';
        sendBtn.disabled = true;

        try {
            const response = await fetch('/api/v1/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: userQuestion })
            });

            const data = await response.json();
            const botReply = data.answer || "Sorry, I couldn't understand that.";
            chatQuestions.appendChild(createChatMessage(botReply));
        } catch (err) {
            chatQuestions.appendChild(createChatMessage("⚠️ Chatbot error. Please try again later."));
            console.error('Chat Error:', err);
        } finally {
            sendBtn.disabled = false;
        }
    }

    sendBtn.addEventListener('click', sendChatQuestion);
    userInputField.addEventListener('keydown', e => {
        if (e.key === 'Enter') sendChatQuestion();
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add hover effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}); 