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
    
    let questionCount = 0;
    const MAX_QUESTIONS = 3;

    // Predefined questions and answers
    const predefinedQuestions = [
        {
            id: 1,
            question: "Need help with baby care?",
            answer: "Our expert team can help you with feeding schedules, sleep training, and general baby care advice. Would you like to schedule a consultation?"
        },
        {
            id: 2,
            question: "Having trouble with the website?",
            answer: "I can help you navigate our website. What specific feature are you having trouble with?"
        },
        {
            id: 3,
            question: "Looking for expert advice?",
            answer: "We have certified pediatricians and child development experts available. Would you like to connect with one of our experts?"
        },
        {
            id: 4,
            question: "Want to join a community?",
            answer: "Our community is a great place to connect with other parents. Would you like to join our parent support group?"
        },
        {
            id: 5,
            question: "Need help with your account?",
            answer: "I can help you with account-related issues. What specific problem are you experiencing?"
        }
    ];

    // Create chat message element
    function createChatMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
        messageDiv.textContent = content;
        return messageDiv;
    }

    // Show final message after max questions
    function showFinalMessage() {
        const finalMessage = createChatMessage("One of our team members will contact you shortly. Please wait!");
        chatQuestions.innerHTML = '';
        chatQuestions.appendChild(finalMessage);
    }

    // Handle question click
    function handleQuestionClick(questionId, questionText) {
        if (questionCount >= MAX_QUESTIONS) {
            showFinalMessage();
            return;
        }

        const question = predefinedQuestions.find(q => q.id === questionId);
        if (!question) return;

        // Add user's question
        chatQuestions.appendChild(createChatMessage(questionText, true));
        
        // Add bot's answer after a short delay
        setTimeout(() => {
            chatQuestions.appendChild(createChatMessage(question.answer));
            questionCount++;
            
            if (questionCount >= MAX_QUESTIONS) {
                setTimeout(showFinalMessage, 1000);
            }
        }, 500);
    }

    // Initialize chat questions
    function initializeChatQuestions() {
        chatQuestions.innerHTML = '';
        predefinedQuestions.forEach(q => {
            const button = document.createElement('button');
            button.className = 'chat-question';
            button.textContent = q.question;
            button.addEventListener('click', () => handleQuestionClick(q.id, q.question));
            chatQuestions.appendChild(button);
        });
    }

    // Initialize chat when page loads
    initializeChatQuestions();

    // Chat button click handler
    chatButton.addEventListener('click', function() {
        chatArea.classList.toggle('active');
        if (!chatArea.classList.contains('active')) {
            // Reset chat when closed
            questionCount = 0;
            initializeChatQuestions();
        }
    });

    // Close chat button click handler
    closeChat.addEventListener('click', function() {
        chatArea.classList.remove('active');
        // Reset chat when closed
        questionCount = 0;
        initializeChatQuestions();
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