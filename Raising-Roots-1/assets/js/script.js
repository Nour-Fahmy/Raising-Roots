document.addEventListener('DOMContentLoaded', function() {
    const chatButton = document.getElementById('chatButton');
    const chatArea = document.getElementById('chatArea');
    const closeChat = document.querySelector('.close-chat');
    const chatQuestions = document.querySelector('.chat-questions');
    
    let questionCount = 0;
    const MAX_QUESTIONS = 3;

    // Function to create chat messages
    function createChatMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
        messageDiv.textContent = content;
        return messageDiv;
    }

    // Function to show final message
    function showFinalMessage() {
        const finalMessage = createChatMessage("One of our team members will contact you shortly. Please wait!");
        chatQuestions.innerHTML = '';
        chatQuestions.appendChild(finalMessage);
    }

    // Function to handle question click
    async function handleQuestionClick(questionId, questionText) {
        if (questionCount >= MAX_QUESTIONS) {
            showFinalMessage();
            return;
        }

        try {
            // Add user's question
            chatQuestions.appendChild(createChatMessage(questionText, true));
            
            // Get answer from server
            const response = await fetch(`/api/chatbot/answer/${questionId}`);
            const data = await response.json();
            
            if (data.answer) {
                // Add bot's answer after a short delay
                setTimeout(() => {
                    chatQuestions.appendChild(createChatMessage(data.answer));
                    questionCount++;
                    
                    if (questionCount >= MAX_QUESTIONS) {
                        setTimeout(showFinalMessage, 1000);
                    }
                }, 500);
            }
        } catch (error) {
            console.error('Error:', error);
            chatQuestions.appendChild(createChatMessage('Sorry, there was an error processing your request.'));
        }
    }

    // Function to initialize chat questions
    async function initializeChatQuestions() {
        try {
            const response = await fetch('/api/chatbot/questions');
            const questions = await response.json();
            
            chatQuestions.innerHTML = '';
            questions.forEach(q => {
                const button = document.createElement('button');
                button.className = 'chat-question';
                button.textContent = q.question;
                button.addEventListener('click', () => handleQuestionClick(q.id, q.question));
                chatQuestions.appendChild(button);
            });
        } catch (error) {
            console.error('Error loading questions:', error);
            chatQuestions.innerHTML = '<p>Sorry, there was an error loading the questions.</p>';
        }
    }

    // Initialize chat questions when the page loads
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
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}); 