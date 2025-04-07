// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Chatbot functionality
    const chatButton = document.getElementById('chatButton');
    const chatArea = document.getElementById('chatArea');
    const closeChat = document.querySelector('.close-chat');
    const chatQuestions = document.querySelectorAll('.chat-question');

    chatButton.addEventListener('click', function() {
        chatArea.classList.toggle('active');
    });

    closeChat.addEventListener('click', function() {
        chatArea.classList.remove('active');
    });

    chatQuestions.forEach(question => {
        question.addEventListener('click', function() {
            // Here you can add the logic for what happens when a question is clicked
            // For now, we'll just log the question text
            console.log('Question clicked:', this.textContent);
            // You can add your own logic here, like redirecting to specific pages
            // or showing more detailed help options
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

    // Add active state to navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.classList.add('active');
        });
        item.addEventListener('mouseleave', function() {
            this.classList.remove('active');
        });
    });
}); 